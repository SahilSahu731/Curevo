"use client";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-body pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white font-heading mb-4">Cookie Policy</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-12">Last updated: October 24, 2024</p>
                
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p className="lead">
                        This Cookie Policy explains what cookies are, how we use cookies, how third-parties we may partner with may use cookies on the Service, your choices regarding cookies, and further information about cookies.
                    </p>

                    <h3>1. What are cookies</h3>
                    <p>
                        Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you. Cookies can be "persistent" or "session" cookies.
                    </p>

                    <h3>2. How Curevo uses cookies</h3>
                    <p>
                        When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:
                    </p>
                    <ul>
                        <li>To enable certain functions of the Service.</li>
                        <li>To provide analytics.</li>
                        <li>To store your preferences.</li>
                        <li>To enable advertisements delivery, including behavioral advertising.</li>
                    </ul>
                    <p>
                        We use both session and persistent cookies on the Service and we use different types of cookies to run the Service:
                    </p>
                    <ul>
                        <li><strong>Essential cookies:</strong> We may use essential cookies to authenticate users and prevent fraudulent use of user accounts.</li>
                        <li><strong>Preferences cookies:</strong> We may use perferences cookies to remember information that changes the way the Service behaves or looks, such as the "remember me" functionality of a registered user or a user's language preference.</li>
                        <li><strong>Analytics cookies:</strong> We may use analytics cookies to track information how the Service is used so that we can make improvements. We may also use analytics cookies to test new advertisements, pages, features or new functionality of the Service to see how our users react to them.</li>
                    </ul>

                    <h3>3. Third-party cookies</h3>
                    <p>
                        In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
                    </p>

                    <h3>4. What are your choices regarding cookies</h3>
                    <p>
                        If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
                    </p>

                    <h3>5. More information</h3>
                    <p>
                        You can learn more about cookies and the following third-party websites:
                    </p>
                    <ul>
                        <li><a href="http://www.allaboutcookies.org/">AllAboutCookies</a></li>
                        <li><a href="http://www.networkadvertising.org/">Network Advertising Initiative</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
