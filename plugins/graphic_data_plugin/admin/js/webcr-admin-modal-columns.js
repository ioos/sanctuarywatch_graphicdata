// These functions only fire on the Modal admin columns screen 

// change contents of Scenes dropdown filter based on instance
function modal_instance_change(){
    const modal_instance_value = document.getElementById("modal_instance").value;
    let modal_scene = document.getElementById("modal_scene");
    modal_scene.innerHTML=null;
    let modal_scene_first_option = document.createElement("option");
    modal_scene_first_option.value = "";
    modal_scene_first_option.text = "All Scenes";
    modal_scene.appendChild(modal_scene_first_option);

    if (modal_instance_value != ""){
        const protocol = window.location.protocol;
        const host = window.location.host;
        const restURL = protocol + "//" + host  + "/wp-json/wp/v2/scene?_fields=id,title&scene_location=" +modal_instance_value;
        fetch(restURL)
        .then(response => response.json())
        .then(data => {        
            data.forEach(targetRow => {
                    let optionScene = document.createElement('option');
                    optionScene.value = targetRow['id'];
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = targetRow['title']['rendered'];
    optionScene.text = tempDiv.textContent;
                    modal_scene.appendChild(optionScene);
            });
        })
        .catch((err) => {console.error(err)});
    }

}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("modal_instance").addEventListener("change", modal_instance_change);
});