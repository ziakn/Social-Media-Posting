import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1 pt-20"> {/* Add padding for fixed navbar */}
                {children}
            </div>
            {/* <Footer /> */}
        </div>
    );
}
