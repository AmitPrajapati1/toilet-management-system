import GenericCrud from "./GenericCrud";
export default function Maintenance(){return <GenericCrud title="Maintenance" path="maintenance" fields={[
 {key:"title",label:"Title",required:true,col:"col-md-6"},{key:"description",label:"Description",col:"col-md-6"},
 {key:"priority",label:"Priority",type:"select",options:["Low","Medium","High","Urgent"],col:"col-md-6"},
 {key:"status",label:"Status",type:"select",options:["Open","In Progress","Completed","Cancelled"],col:"col-md-6"}
]}/>}
