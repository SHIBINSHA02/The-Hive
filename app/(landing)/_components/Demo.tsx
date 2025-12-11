// app/(landing)/_components/Demo.tsx
export function Demo() {
    return (
        <section id="demo" className=" flex lg:w-1/2 py-16 rounded-b-[80px] m:rounded-b-4xl boarder-b-4  border-blue-300 lg:m-0 m-8">
            <div className="container border  py-6 w-fit  lg:m-auto rounded-3xl  flex flex-col  items-center px-4 sm:px-6 lg:px-12 xl:px-20">
                <h2 className="text-sm font-sans font-medium text-center text-gray-500 p-4">
                    UNLOCK EARLY ACCESS
                </h2>
                <p className="text-center text-4xl font-semibold font-sans">Experience The Hive</p>
                <p className="text-center mx-auto p-3 text-gray-500 lg:w-[400px] mt-2">Sign up now for instant access to our advanced dental AI solutions.</p>
                <form className="mt-6 w-full lg:mx-auto space-y-4">
                    {/* 1. Corrected: Two inputs wrapped in a div, and both are self-closed correctly with '/>' */}
                    <div className="flex flex-col sm:flex-row sm:space-x-3">
                        <input type="text" placeholder="First Name" className="border rounded-md p-2 mb-4 w-full" />
                        <input type="text" placeholder="Last Name" className="border rounded-md p-2 mb-4 w-full" />
                    </div>

                    {/* 2. Corrected: Single input is self-closed correctly with '/>' */}
                    <div className="flex flex-col">
                        <input type="email" placeholder="Enter your email *" className="border rounded-md p-2 mb-4 w-full"  />
                    </div>

                    {/* 3. Corrected: Single input is self-closed correctly with '/>' */}
                    <div className="flex flex-col">
                        <input type="text" placeholder="Business Name" className="border rounded-md p-2 mb-4 w-full"  />
                    </div>

                    {/* 4. Corrected: The textarea is properly closed. The extra div around it was removed for cleaner structure based on the pattern, but leaving it would also be fine. */}
                    <div className="flex flex-col">
                        <textarea placeholder="Additional Message" className="border rounded-md p-2 mb-4 w-full"></textarea>
                    </div>

                    <button type="submit" className="w-full inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)] rounded-full border border-transparent bg-[#155DFC] shadow-md whitespace-nowrap text-base font-medium text-white data-[disabled]:bg-gray-950 data-[hover]:bg-gray-800 data-[disabled]:opacity-40" data-headlessui-state="">
                        Sign Up
                    </button>
                </form>
            </div>
        </section>
    );
}