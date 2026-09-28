import GenericCrud from "./GenericCrud";
export default function IndividualCollection(){return <GenericCrud title="Individual Payments" path="individual" fields={[
 {key:"amount",label:"Amount",type:"number",min:"0",required:true,col:"col-md-6"},{key:"method",label:"Payment Method",type:"select",options:["Cash","UPI","Bank Transfer","Other"],col:"col-md-6"},
 {key:"collector",label:"Collector",col:"col-md-6"},{key:"note",label:"Note",col:"col-md-6"}
]}/>}
