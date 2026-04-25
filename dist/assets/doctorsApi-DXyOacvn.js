import{o}from"./index-BE1pFIM-.js";const e={async getDoctors(t){return(await o.get("/doctors",{params:t})).data},async getDoctorById(t){return(await o.get(`/doctors/${t}`)).data}};export{e as d};
