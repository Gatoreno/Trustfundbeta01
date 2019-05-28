
    // -- /get-owners
    function getplans() {

        $.ajax({
            type: 'GET',
            url: '/plan-list',
            dataType: 'json',
                success: (data) => {
                    console.log(data)
                    data.forEach((item) => {

                        const row = `<div class="col-lg-4">
                        <a>${ item.id}</a>
                    
                        <a>${ item.amount}</a>
                        



                    <div class="jumbotron"> <h2 class="">${ item.name}</h2>
                        <p class="lead">
                            ${ item.amount}
                        </p>
                        <hr class="my-4">
                        <a class="btn btn-primary btn-lg" href="#" role="button">Saber más</a>
                    </div>


                    </div>`;
                        $('#plansT').append(row);
                    });
                }

        });
        //$("#ownerT").load();

    };

// -- /get-owners
function getowners(){
    
    $.ajax({
        type: 'GET',
        url: '/get-owners',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img width="96px" height="65px"  src="${ item.img }"></td>
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
function getprojectsIT(){
    $.ajax({
        type: 'GET',
        url: '/projects-json',
        dataType: 'json',
        success: (data) => {
            console.log(data);
            var $select = $('#projectS');
            $.each(data.projects, function (id,proj) {
                
                $select.append('<option value=' + proj.id + '>' + proj.title + '</option>');
            });       
        }

    });
}
function getadmins(){
    
    $.ajax({
        type: 'GET',
        url: '/get-admins',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td><img width="96px" height="65px" src="${ item.img }"></td>
                    <td>${ item.name }</td>
                    <td><a href="/get-user-edit/${ item.id}"><button>Editar</button></a></td>
                </tr>`;
                $('#usersT').append( row );
            });
        }

    });
    //$("#ownerT").load();

};
function getclients(){
    $.ajax({
        type: 'GET',
        url: '/clients-list',
        dataType: 'json',
        success: (data) => {

            data.forEach( ( item ) => {
                const row = `<tr>
                    <td>
                    <input class="form-control" type="checkbox" value="1${ item.id }" ></td>
                    <td>${ item.name }</td>
                    <td>${ item.creation_date }</td>
                    <td>${ item.email}</td>
                    <td><a href="${ item.id}">ver mas<a></td>
                    <td><a href="/client-delete/${ item.id}">ver mas<a></td>
                </tr>`;
                $('#clientsT').append( row );
            });
        }

    });
}

function getmedallas() {

    $.ajax({
        type: 'GET',
        url: '/medallas',
        dataType: 'json',
            success: (data) => {
                console.log(data)
                data.forEach((item) => {

                    const row = `<tr>
                                    <td><img width="50px" src="${ item.img }"/></td>
                                    <td>${ item.name }</td>
                                    <td><a href="/badge/${ item.id }">Detalles</a></td>
                                </tr>`;
                    $('#medallasT').append(row);
                });
            }

    });
    //$("#ownerT").load();

};

getowners(),getmedallas(),getadmins(),getclients(),getprojects(),getNews(),getprojectsIT();