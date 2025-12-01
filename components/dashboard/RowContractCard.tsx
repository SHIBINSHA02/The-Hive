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
    
    <div>
        <p>{companyName}</p>
        <div className="boarder flex">
              <img className="w-6 m-3 " src={companyLogo} alt="company logo" />
        </div>
        
        <p>{title}</p>
        <p>{description}</p>
        <p>{startDate}</p>
        <p>{deadline}</p>
        <p >{progress}%</p>
        
    </div>
      
  )
}
