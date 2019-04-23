function pagintaionNews(){
    $.ajax({
        
        url: '/pag-news',
        type: 'GET',
        dataType: "json",
        data:{
            page: 1,
            pagelimit: 10
        },
        success: (data) =>{

            console.log(data)

        },
        error: (jqXHR,textStatus,errorThrown) =>{
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });


}





pagintaionNews();