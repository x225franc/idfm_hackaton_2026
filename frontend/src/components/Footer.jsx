export default function Footer() {
    return (
        <footer className="mt-10 border-t border-slate-300 pt-6 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Projet IDFM Hackathon. Tous droits réservés.</p>
        </footer>
    );
}