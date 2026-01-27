import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";

export default function BlogPostCard({ post }) {
    return (
        <div className="group flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b border-gray-100 last:border-0">
            {/* Image Container */}
            <div className="w-full md:w-[320px] aspect-[16/9] md:aspect-[4/3] rounded-xl bg-gray-100 shrink-0 overflow-hidden relative border border-gray-100">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
                        No Image Available
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-primary">
                    <span>{post.category}</span>
                </div>

                <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="text-2xl font-bold text-gray-900 font-display group-hover:text-primary transition-colors">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-gray-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                </p>

                <div className="flex items-center gap-6 pt-2 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                    </div>
                </div>
            </div>
        </div>
    );
}
