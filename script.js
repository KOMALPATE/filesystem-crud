$(document).ready(() => {
  getuser();

});
function addmodalbtn1() {
  $("#usernamerror").addClass("d-none");
  $("#emailerror").addClass("d-none");
  $("#mobilenoerror").addClass("d-none");
  $("#UserName").val();
  $("#Email").val();
  $("#MobileNo").val();

}
const editmodalbtn1 = (row) => {
  $("#UserName").val(row.uname);
  $("#Email").val(row.email);
  $("#MobileNo").val(row.mobileno);
  $("#userid").val(row.id);
}
var modaltype = '';
const openmodal = (modal, row) => {
  if ('updatemodal' == modal) {
    modaltype = 'updatemodal';

    editmodalbtn1(row);
  }
  else if ('addmodal' == modal) {
    modaltype = 'addmodal'
    addmodalbtn1();

  } else {
    console.log("not match modal");
  }
}
function submitbtn(event) {
  if (modaltype == 'updatemodal') {
    updateuser(event);
    alert("update submit")
    console.log(":::data submit");
  } else {
    adduser(event);
    alert("add submit")
  }
}

function adduser(event) {
  event.preventDefault();
  let formData = new FormData();
  let userImg = $("#userImage")[0].files[0];
  console.log("::::::::::", formData);
  console.log("userImg", userImg)
  let id = Math.random();
  let UserName = $("#UserName").val();
  let Email = $("#Email").val();
  let MobileNo = $("#MobileNo").val();
  formData.append("id", id)
  formData.append("UserName", UserName);
  formData.append("Email", Email);
  formData.append("MobileNo", MobileNo);
  formData.append("profilename", userImg);
  if (UserName != '' && Email != '' && MobileNo != '') {
    $('#spinner').removeClass('d-none')
    showloader();
    if (UserName != '', Email != '', MobileNo != '') {
      $.ajax({
        type: 'POST',
        enctype: 'multipart/form-data',
        url: "http://localhost:4000/user/add",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.status == true)
            $("#UserName").val('');
          $("#Email").val('');
          $("#MobileNo").val('');
          console.log(":::::::::addresponse::::::", response);
          $("#exampleModal").modal('hide');
          closeloader();
          getuser();
        },
      })

    }
  } else {
    if (uname == '') $("#usernamerror").removeClass("d-none");
    if (email == '') $("#emailerror").removeClass("d-none");
    if (mobileno == '') $("#mobilenoerror").removeClass("d-none");
  }

}

//usergetdata//
function getuser() {
  // showloader();
  $.ajax({
    type: "GET",
    url: "http://localhost:4000/user/get",
    dataType: "json",
    contentType: "application/json",
    success: function (response) {
      console.log(":::::::::response::::::", response);

      if (response.status == true) {
        $("#customerTbody").empty();
        closeloader();
        var data = response.data;
        console.log(data);
        var files = response.files;
        console.log(files);
        for (i = 0; i < data.length; i++) {
          let ele = response.data[i];
          ele.files = response.files[i];
          let tr = `<tr><th>${i + 1}</th><th>${ele.UserName}</th>
          <th>${ele.Email}</th><th>${ele.MobileNo}</th>
          <th><span onclick='openmodal("updatemodal",(${JSON.stringify(ele)}))' 
          class="btnedit"data-bs-toggle="modal" 
          data-bs-target="#exampleModal"><i class="bi bi-pen"></i></span>
          <span onclick='deleteuser(${JSON.stringify(ele)})'class="btnDelete">
          <i class="bi bi-trash"></i></span><span onclick='emailmodal'
           class="btnedit"data-bs-toggle="modal" 
          data-bs-target="#mailModal"><i class="bi bi-envelope"></i></span></th>
          <th><img style=width:50px height:50px; src="./upload/${ele.files}"></th></tr>`;
          $("#customerTbody").append(tr);
          $(document).on('click', '.btnDelete', function () {
            $(this).closest('tr').remove('tr');
            return false;

          })
        }
      }
    }
  })
}
const edituser = (row) => {
  $("#UserName").val(row.UserName);
  $("#Email").val(row.Email);
  $("#MobileNo").val(row.MobileNo);
  $("#userid").val(row.id);
}

function updateuser(event) {
  showloader();
  event.preventDefault()
  let formData = new FormData();
  console.log(formData);
  let userImg = $("#userImage")[0].files[0];
  console.log(userImg);
  let usernameup = $("#UserName").val();
  let emailup = $("#Email").val();
  let mobilenoup = $("#MobileNo").val();
  let id = parseFloat($("#userid").val());
  formData.append("id", id);
  formData.append("UserName", usernameup);
  formData.append("Email", emailup);
  formData.append("MobileNo", mobilenoup);
  formData.append("profilename", userImg);
  let userupdatedata = { id: id, UserName: usernameup, Email: emailup, MobileNo: mobilenoup };
  console.log("::::::::::::upd", userupdatedata);
  // $('#spinner1').removeClass('d-none');
  $.ajax({
    type: "PUT",
    enctype: 'multipart/form-data',
    url: "http://localhost:4000/user/update",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response);

      closeloader();
      if (response.status == true) {
        $("#UserName").val('');
        $("#Email").val('');
        $("#MobileNo").val('');
        console.log(":::::::::response::::::", response);
        $("#exampleModal").modal('hide');
        getuser();
      }
    }
  })
}
const deleteuser = (row) => {
  console.log(row);
  $.ajax({
    type: "DELETE",
    url: "http://localhost:4000/user/delete",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(row),
    success: function (response) {
      console.log("::::::::", response);
      if (response.status == true) {
        adduser();
      }
    }
  })
};
function showloader() {
  setTimeout(function () {
    $('#loader').removeClass('d-none')
  }, 3000)
}
function closeloader() {
  setTimeout(function () {
    $('#loader').addClass('d-none')
  }, 3000)
}
// function submitbtn() {
//   $('#spinner').addClass('d-none')
//   $('#spinner1').addClass('d-none')
// }
$("#userImage").change(function () {
  getimge()
  function getimge() {
    const files = $("#userImage")[0].files[0];
    if (files) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(files);
      fileReader.onload = function () {
        $("#frame").html('<img src="' + this.result + '">');
      }
    }

  }
})
function emailmodal(){
  let email=$("#email").val();
  let subject=$("#subject").val();
  let description=$("#desc").val();
  let emaildata = { email: email, subject: subject, description: description};
  console.log("::::::::::::email...", emaildata);
  $.ajax({
    type:'POST',
    url: "http://localhost:4000/user/sendmail",
    dataType:'json',
    contentType:"application/json",
    data:JSON.stringify(emaildata),
    success:function(response){
        console.log(response);
    }
 })
}
  