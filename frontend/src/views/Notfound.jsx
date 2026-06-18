import { Link } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import PageHeading from '@/components/PageHeading';
import Button from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <HeroBanner title="404" subtitle="Terminus non desservi" />

            <div className="flex-1 px-5 py-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
                <PageHeading
                    title="Page introuvable"
                    description="Cette page n'existe pas ou a changé de quai. Vérifiez l'adresse ou retournez à l'accueil."
                    className="mb-8"
                />

                <Link to="/" className="w-full">
                    <Button variant="primary" full>
                        Retourner à l'accueil
                        <IconHome size={18} stroke={2.5} />
                    </Button>
                </Link>
            </div>

            <Footer />
        </div>
    );
}
