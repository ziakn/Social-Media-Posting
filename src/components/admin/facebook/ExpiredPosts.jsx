"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ExpiredPosts({ posts = [] }) {
  if (posts.length === 0) {
    return (
      <Card className="p-16 text-center border-dashed border-2 border-muted">
        <CardContent>
          <div className="text-xl font-semibold mb-4">
            No expired posts
          </div>
          <p className="text-muted-foreground">
            Expired posts will appear here for reference.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="rounded-xl shadow-sm opacity-70">
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              {post.type}
            </div>
            <div className="text-base font-medium">{post.caption}</div>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="mt-2 rounded-lg max-h-40 w-full object-cover"
              />
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Expired on: {post.expiredAt || "—"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
