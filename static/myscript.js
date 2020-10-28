
  var modal=document.getElementById('user-popup-wrapper');
  window.onclick= function(event) { 
  if(event.target==modal)
  {
    document.getElementById("user-popup").style.display = "none";
    }
    }

    function confirmEmail() {
      var email = document.getElementById("email").value
      var cemail = document.getElementById("cemail").value
      if(email != cemail) {
          alert('Email Not Matching!');
          document.getElementById("wrongemail").style.display="inline-block";
          document.getElementById("rightemail").style.display="none";
      }
      else
      {
        document.getElementById("wrongemail").style.display="none";
        document.getElementById("rightemail").style.display="inline-block";
      }
  }

  function confirmPassword() {
    var password = document.getElementById("password").value
    var cpassword = document.getElementById("cpassword").value
    if(password != cpassword) {
        alert('Password Not Matching!');
        document.getElementById("wrongpassword").style.display="inline-block";
        document.getElementById("rightpassword").style.display="none";
    }
    else{
      document.getElementById("wrongpassword").style.display="none";
      document.getElementById("rightpassword").style.display="inline-block";
    }
}