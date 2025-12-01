// components/dashboard/RowContractCard.tsx
"use client";

interface ContractCardProps {
    companyName: string;
    companyLogo: string;
    title: string;
    description: string;
    startDate: string;
    deadline: string;
    progress: number;
    
}


export const RowContractCard = (
    {
    companyName,
    companyLogo,
    title,
    description,
    startDate,
    deadline,
    progress,
   
}: ContractCardProps
) => {
  return (
    
    <div className=" p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h1 className="text-lg">{title}</h1>
       <div className="inline-flex space-x-4 items-center mb-2">
        <div className="border border-gray-100 w-14 h-14 rounded-xl justify-center items-center flex">
              <img className="h-auto w-10 m-3" src={companyLogo} alt="company logo" />
        </div>
        <h2 className="text-md">{companyName}</h2>
        </div>
        
        <p>{description}</p>
        <p>{startDate}</p>
        <p>{deadline}</p>
        <p >{progress}%</p>
        
    </div>
      
  )
}
