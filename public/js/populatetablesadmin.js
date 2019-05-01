
// -- /get-owners
function getowners(){
    
    $.ajax({
        type: 'GET',
        url: '/get-owners',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img src="${ item.img }"></td>
                    <td>${ item.name }</td>
                    <td><a href="/get-user/${ item.id}"><button>Editar</button></a></td>
                </tr>`;
                $('#ownerT').append( row );
            });
        }

    });
    //$("#ownerT").load();

};

function getprojects(){
    
    $.ajax({
        type: 'GET',
        url: '/get-projects',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img width="155px" src="/uploads/${ item.img }"></td>
                    <td>${ item.title }</td>
                    <td><a href="/projects/update-project/${item.id}" class="btn btn-default">Editar</a></td>
                    <td><a href="" class="btn btn-danger">Eliminar</a></td>
                </tr>`;
                $('#projectsT').append( row );
            });
        }

    });
    //$("#ownerT").load();

};
function getNews(){
    $.ajax({
        type: 'GET',
        url: '/get-news',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img width="155px" src="/uploads/${ item.imgh }"><br></td>
                    <td>${ item.title }</td>
                    <td>${ item.created_at }</td>
                    <td><a href="/news/edit/${ item.id } " class="btn btn-default">Editar</a></td>
                </tr>`;
                $('#newsT').append( row );
            });
        }

    });
};
function getadmins(){
    
    $.ajax({
        type: 'GET',
        url: '/get-admins',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img src="${ item.img }"></td>
                    <td>${ item.name }</td>
                    <td><a href="/get-user-edit/${ item.id}"><button>Editar</button></a></td>
                </tr>`;
                $('#usersT').append( row );
            });
        }

    });
    //$("#ownerT").load();

};

getowners(),getadmins(),getprojects(),getNews();