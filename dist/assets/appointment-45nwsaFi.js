function o(){return new Date().toISOString().split("T")[0]}function r(e,a){return new Set(e.filter(t=>t.status==="scheduled"&&t.date===a).map(t=>t.timeSlot))}export{r as a,o as g};
