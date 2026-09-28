import GenericCrud from "./GenericCrud";
export default function Cleaning(){return <GenericCrud title="Cleaning" path="cleaning" fields={[
 {key:"date",label:"Date",type:"date",required:true,col:"col-md-6"},{key:"cleaner",label:"Cleaner",required:true,col:"col-md-6"},
 {key:"area",label:"Area",required:true,col:"col-md-6"},{key:"notes",label:"Notes",col:"col-md-6"}
]}/>}
