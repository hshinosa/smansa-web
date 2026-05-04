"""
Instagram Scraper via Apify API
SMAN 1 Baleendah - News Feed Automation

Uses Apify's Instagram Scraper actor to fetch posts without needing
bot accounts or direct Instagram login.
"""

import requests
import time
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
from models import RawNewsFeed, get_session
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv

load_dotenv()

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

APIFY_API_TOKEN = os.getenv('APIFY_API_TOKEN', '')
APIFY_ACTOR_ID = 'apify~instagram-scraper'


class ApifyInstagramScraper:
    def __init__(self):
        self.session = get_session()
        self.download_dir = Path("./downloads")
        self.download_dir.mkdir(exist_ok=True)
        self.api_token = APIFY_API_TOKEN

    def validate_config(self):
        """Validate Apify API token is configured"""
        if not self.api_token:
            print("❌ APIFY_API_TOKEN not set!")
            print("   Set it in .env or environment variable")
            return False
        print(f"✓ Apify API token configured (ends with ...{self.api_token[-4:]})")
        return True

    def run_apify_actor(self, target_username, max_posts=100):
        """
        Run Apify Instagram Scraper actor and wait for results.

        Args:
            target_username: Instagram username to scrape
            max_posts: Maximum posts to retrieve

        Returns:
            list: Array of post data dicts, or None on failure
        """
        print(f"\n🚀 Starting Apify Instagram Scraper...")
        print(f"   Target: @{target_username}")
        print(f"   Max posts: {max_posts}")

        # Actor input configuration
        actor_input = {
            "directUrls": [f"https://www.instagram.com/{target_username}/"],
            "resultsType": "posts",
            "resultsLimit": max_posts,
            "searchType": "user",
            "searchLimit": 1,
        }

        # Start actor run
        run_url = f"https://api.apify.com/v2/acts/{APIFY_ACTOR_ID}/runs"
        headers = {
            "Content-Type": "application/json",
        }
        params = {"token": self.api_token}

        print(f"   📡 Sending request to Apify...")

        try:
            response = requests.post(run_url, json=actor_input, headers=headers, params=params, timeout=30)

            if response.status_code != 201:
                print(f"   ❌ Failed to start actor: {response.status_code}")
                print(f"      {response.text[:500]}")
                return None

            run_data = response.json()['data']
            run_id = run_data['id']
            print(f"   ✓ Actor run started: {run_id}")

        except Exception as e:
            print(f"   ❌ Error starting actor: {e}")
            return None

        # Poll for completion
        print(f"   ⏳ Waiting for results...")
        status_url = f"https://api.apify.com/v2/actor-runs/{run_id}"
        max_wait = 600  # 10 minutes max
        elapsed = 0
        poll_interval = 10

        while elapsed < max_wait:
            time.sleep(poll_interval)
            elapsed += poll_interval

            try:
                status_resp = requests.get(status_url, params=params, timeout=15)
                if status_resp.status_code != 200:
                    continue

                status_data = status_resp.json()['data']
                status = status_data['status']

                if status == 'SUCCEEDED':
                    print(f"   ✅ Actor completed in {elapsed}s")
                    break
                elif status in ('FAILED', 'ABORTED', 'TIMED-OUT'):
                    print(f"   ❌ Actor {status}")
                    return None
                else:
                    mins = elapsed // 60
                    secs = elapsed % 60
                    print(f"      ... {status} ({mins}m {secs}s elapsed)")

            except Exception as e:
                print(f"      ⚠️  Poll error: {e}")

        else:
            print(f"   ❌ Timed out after {max_wait}s")
            return None

        # Fetch results from dataset
        dataset_id = status_data.get('defaultDatasetId')
        if not dataset_id:
            print("   ❌ No dataset ID in run result")
            return None

        dataset_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items"
        try:
            items_resp = requests.get(dataset_url, params={**params, "format": "json"}, timeout=60)
            if items_resp.status_code != 200:
                print(f"   ❌ Failed to fetch dataset: {items_resp.status_code}")
                return None

            items = items_resp.json()
            print(f"   📦 Retrieved {len(items)} items from dataset")
            return items

        except Exception as e:
            print(f"   ❌ Error fetching dataset: {e}")
            return None

    def is_already_scraped(self, shortcode):
        """Check if post already exists in database"""
        exists = self.session.query(RawNewsFeed).filter_by(post_shortcode=shortcode).first()
        return exists is not None

    def download_image(self, url, target_dir, filename):
        """Download image from URL to local path"""
        try:
            resp = requests.get(url, timeout=30, stream=True)
            if resp.status_code == 200:
                filepath = target_dir / filename
                with open(filepath, 'wb') as f:
                    for chunk in resp.iter_content(8192):
                        f.write(chunk)
                return str(filepath.relative_to(self.download_dir))
        except Exception as e:
            print(f"      ⚠️  Image download failed: {e}")
        return None

    def process_results(self, items, target_username):
        """
        Process Apify results and save to database.

        Args:
            items: List of post data from Apify
            target_username: Source username
        """
        print(f"\n📝 Processing {len(items)} posts...")

        target_dir = self.download_dir / target_username
        target_dir.mkdir(exist_ok=True)

        scraped_count = 0
        skipped_count = 0
        error_count = 0

        for i, item in enumerate(items, 1):
            shortcode = item.get('shortCode') or item.get('id', f'unknown_{i}')

            # Check for duplicates
            if self.is_already_scraped(shortcode):
                print(f"[{i:3d}] ⏭️  Skipped (duplicate): {shortcode}")
                skipped_count += 1
                continue

            try:
                # Extract post data
                caption = item.get('caption', '') or ''
                likes = item.get('likesCount', 0) or 0
                comments = item.get('commentsCount', 0) or 0

                # Parse post date
                post_date = None
                timestamp = item.get('timestamp')
                if timestamp:
                    try:
                        post_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    except (ValueError, AttributeError):
                        post_date = datetime.utcnow()

                # Download images
                image_paths = []
                display_url = item.get('displayUrl')
                if display_url:
                    filename = f"{shortcode}_0.jpg"
                    path = self.download_image(display_url, target_dir, filename)
                    if path:
                        image_paths.append(path)

                # Handle carousel/sidecar posts (multiple images)
                images = item.get('images') or item.get('childPosts') or []
                for idx, img in enumerate(images):
                    if isinstance(img, str):
                        img_url = img
                    elif isinstance(img, dict):
                        img_url = img.get('displayUrl') or img.get('url')
                    else:
                        continue
                    if img_url:
                        filename = f"{shortcode}_{idx + 1}.jpg"
                        path = self.download_image(img_url, target_dir, filename)
                        if path:
                            image_paths.append(path)

                # Save to database
                feed = RawNewsFeed(
                    post_shortcode=shortcode,
                    source_username=target_username,
                    caption=caption,
                    image_paths=image_paths,
                    likes_count=likes,
                    comments_count=comments,
                    post_date=post_date,
                    scraped_at=datetime.utcnow(),
                    is_processed=False
                )

                self.session.add(feed)
                self.session.commit()

                print(f"[{i:3d}] ✅ {shortcode} | 📷 {len(image_paths)} imgs | ❤️  {likes}")
                scraped_count += 1

            except IntegrityError:
                self.session.rollback()
                print(f"[{i:3d}] ⚠️  Duplicate (DB constraint): {shortcode}")
                skipped_count += 1

            except Exception as e:
                self.session.rollback()
                print(f"[{i:3d}] ❌ Error: {e}")
                error_count += 1

        # Summary
        print("\n" + "=" * 70)
        print("                        SCRAPING COMPLETED")
        print("=" * 70)
        print(f"\n📊 Summary:")
        print(f"   ✅ Successfully scraped: {scraped_count}")
        print(f"   ⏭️  Skipped (duplicates): {skipped_count}")
        print(f"   ❌ Errors: {error_count}")
        print(f"   📁 Download directory: {target_dir.absolute()}")
        print()
        print(f"Next Steps:")
        print(f"   1️⃣  Check scraped data: SELECT * FROM sc_raw_news_feeds WHERE is_processed=false;")
        print(f"   2️⃣  Laravel queue worker will process feeds via AI")
        print()

    def cleanup(self):
        """Close database session"""
        self.session.close()


def main():
    parser = argparse.ArgumentParser(
        description='Instagram Scraper (Apify) for SMAN 1 Baleendah News Feed',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scraper.py --target sman1baleendah
  python scraper.py --target sman1baleendah --max-posts 100
        """
    )

    parser.add_argument(
        '--target',
        type=str,
        required=True,
        help='Target Instagram username to scrape'
    )

    parser.add_argument(
        '--max-posts',
        type=int,
        default=50,
        help='Maximum number of posts to scrape (default: 50)'
    )

    args = parser.parse_args()

    # Initialize scraper
    scraper = ApifyInstagramScraper()

    # Validate config
    if not scraper.validate_config():
        scraper.cleanup()
        return

    # Run Apify actor
    try:
        items = scraper.run_apify_actor(args.target, args.max_posts)

        if items:
            scraper.process_results(items, args.target)
        else:
            print("\n❌ No results returned from Apify")

    except KeyboardInterrupt:
        print("\n\n⚠️  Scraping interrupted by user")
    finally:
        scraper.cleanup()
        print("👋 Done!")


if __name__ == "__main__":
    main()
