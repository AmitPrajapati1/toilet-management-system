import GenericCrud from "./GenericCrud";
export default function Staff(){return <GenericCrud title="Staff" path="staff" fields={[
 {key:"name",label:"Name",required:true,col:"col-md-6"},{key:"mobile",label:"Mobile",col:"col-md-6"},
 {key:"role",label:"Role",col:"col-md-6"},{key:"salary",label:"Salary",type:"number",min:"0",col:"col-md-6"}
]}/>}
