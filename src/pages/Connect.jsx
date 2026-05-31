import ConnectPage from "../components/common/ConnectPage"
import NavBar from "../components/navbars/NavBar";
import Footer from '../components/footer/Footer';

const Connect = () => {
    return (
        <>
            <section
                className="
            relative
            w-full
            overflow-visible
        "
            ><div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                </div>
                <NavBar />
                <ConnectPage />
            </section>
            <Footer />
        </>
    );
};
export default Connect;