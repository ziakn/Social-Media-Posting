"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function ExpiringPosts({ posts = [] }) {
  if (posts.length === 0) {
    return (
      <Card className="p-16 text-center border-dashed border-2 border-muted">
        <CardContent>
          <div className="text-xl font-semibold mb-4">
            No expiring posts
          </div>
          <p className="text-muted-foreground">
            Posts nearing expiration will show here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="rounded-xl shadow-sm">
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
              Expires on: {post.expiryDate || "—"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
