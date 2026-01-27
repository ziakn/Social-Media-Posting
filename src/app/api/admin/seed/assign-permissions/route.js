import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";

export async function GET() {
    try {
        // 1. Get all blog-related permission IDs
        const permissionsQuery = query(
            collection(db, "permissions"),
            where("name", "in", ["view_blog", "create_blog", "edit_blog", "delete_blog"])
        );
        const permissionDocs = await getDocs(permissionsQuery);

        if (permissionDocs.empty) {
            return NextResponse.json({ success: false, error: "No blog permissions found. Run permissions seeder first." }, { status: 404 });
        }

        const permissionIds = permissionDocs.docs.map(doc => doc.id);
        console.log("Found blog permissions:", permissionIds);

        // 2. Get the 'admin' role
        // Note: Assuming the role is named 'Admin' or 'admin' and we want to update it.
        // If you use a different identifier, adjust accordingly. 
        // Usually roles are stored with a 'name' field.
        const rolesQuery = query(collection(db, "roles"), where("name", "in", ["Admin", "admin", "Super Admin", "super-admin"]));
        const roleDocs = await getDocs(rolesQuery);

        if (roleDocs.empty) {
            return NextResponse.json({ success: false, error: "Admin role not found." }, { status: 404 });
        }

        let updatedRoles = 0;

        // 3. Update each found admin role to include the new permissions
        for (const roleDoc of roleDocs.docs) {
            // Use arrayUnion to add only if not present
            await updateDoc(roleDoc.ref, {
                permissions: arrayUnion(...permissionIds)
            });
            console.log(`Updated role: ${roleDoc.data().name}`);
            updatedRoles++;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully assigned ${permissionIds.length} blog permissions to ${updatedRoles} admin role(s).`,
            details: {
                permissions: permissionDocs.docs.map(d => d.data().name),
                rolesUpdated: updatedRoles
            }
        });

    } catch (error) {
        console.error("❌ Error assigning permissions:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
