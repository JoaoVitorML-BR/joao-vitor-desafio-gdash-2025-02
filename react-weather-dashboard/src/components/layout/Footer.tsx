export default function Footer() {
    return (
        <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>
                            © 2025 GDASH Weather · Challenge 2025/02
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <a
                            href="https://github.com/JoaoVitorML-BR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            GitHub
                        </a>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span>
                            Desenvolvido por{' '}
                            <strong className="text-gray-900 dark:text-white">
                                JoaoVitorML-BR
                            </strong>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
