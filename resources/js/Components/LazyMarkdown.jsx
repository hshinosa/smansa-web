import React, { lazy, Suspense } from 'react';

const ReactMarkdown = lazy(() => import('react-markdown'));

const remarkGfmPromise = import('remark-gfm').then(mod => mod.default);
const rehypeRawPromise = import('rehype-raw').then(mod => mod.default);

export function LazyMarkdown({ children, components, ...props }) {
    const [plugins, setPlugins] = React.useState({ remarkGfm: null, rehypeRaw: null });

    React.useEffect(() => {
        Promise.all([remarkGfmPromise, rehypeRawPromise]).then(([remarkGfm, rehypeRaw]) => {
            setPlugins({ remarkGfm, rehypeRaw });
        });
    }, []);

    if (!plugins.remarkGfm || !plugins.rehypeRaw) {
        return <div className="animate-pulse bg-gray-100 rounded p-4 min-h-[60px]" />;
    }

    return (
        <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded p-4 min-h-[60px]" />}>
            <ReactMarkdown
                remarkPlugins={[plugins.remarkGfm]}
                rehypePlugins={[plugins.rehypeRaw]}
                components={components}
                {...props}
            >
                {children}
            </ReactMarkdown>
        </Suspense>
    );
}

export default LazyMarkdown;
