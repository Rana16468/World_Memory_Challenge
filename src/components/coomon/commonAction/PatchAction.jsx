

const PatchAction =  (url, selectedSpecialties) => {
    
    fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      
    },

    body: JSON.stringify(selectedSpecialties),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("API ERROR");
      }
      return res.json();
    })
    .then((data) => {
        if(!data){
            console.log("some issues by the recorded section");

        }


      
    })
    .catch((error) => {
      console.log(error);
    });
};

export default PatchAction;
