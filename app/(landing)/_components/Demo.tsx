// app/(landing)/_components/Demo.tsx
export function Demo() {  
    return (
    <section id="demo" className="bg-white  flex items-center py-16 rounded-b-[80px] m:rounded-b-4xl boarder-b-4 border-blue-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 lg:mb-16">
                See The Hive in Action
            </h2>
            <div className="flex justify-center">
                <div className="w-full max-w-4xl aspect-video shadow-lg rounded-xl overflow-hidden">
                 <h1>hil</h1>
                </div>
            </div>
        </div>
    </section>
    );
}   