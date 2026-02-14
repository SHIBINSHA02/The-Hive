// app/(landing)/_components/Testimonials.tsx
export function Testimonials() {  
    return (
    <section id="testimonials" className="bg-gradient-to-t from-30% from-blue-100 to-white flex items-center py-16 lg:rounded-b-4xl boarder-b-4 border-blue-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 lg:mb-16">
                What Our Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Testimonial Card 1 */}
                <div className=" rounded-xl shadow-lg p-6 bg-blue-50">
                    <p className="text-base text-gray-600 mb-4">
                        &ldquo;The Hive transformed our contract management process. The AI-powered features are incredibly accurate and easy to use.&ldquo;
                    </p>
                    <div className="flex items-center">
                        <img
                            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg"
                            alt="Client 1"
                            className="h-12 w-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Jane Doe</p>
                            <p className="text-xs text-gray-600">CEO, TechCorp</p>
                        </div>
                    </div>
                </div>
                {/* Testimonial Card 2 */}
                <div className="rounded-xl shadow-lg p-6 bg-blue-50">
                    <p className="text-base text-gray-600 mb-4">
                        &ldquo;The deadline alerts have been a game-changer for our team. We never miss an important date anymore!&ldquo;
                    </p>
                    <div className="flex items-center">
                        <img
                            src="https://www.faegredrinker.com/-/media/images/professionals/s/johnsmith.jpg?rev=c719fdb7f7d849a0932495cf64159de2&hash=FF7FF415659C9807EC4A662D48BA0EA7"
                            alt="Client 2"
                            className="h-12 w-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">John Smith</p>
                            <p className="text-xs text-gray-600">Legal Advisor, LawFirm</p>
                        </div>
                    </div>
                </div>
                {/* Testimonial Card 3 */}
                <div className=" rounded-xl shadow-lg p-6 bg-blue-50">
                    <p className="text-base text-gray-600 mb-4">
                        &ldquo;The conversational AI feature allowed us to quickly get answers about our contracts. It&apos;s like having a legal expert on call!&ldquo;
                    </p>
                    <div className="flex items-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTldNvlNnYLUznGNLtm0YmymI4os69Aqx24ow&s"
                            alt="Client 3"
                            className="h-12 w-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Emily Johnson</p>
                            <p className="text-xs text-gray-600">COO, BizSolutions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    );
}       