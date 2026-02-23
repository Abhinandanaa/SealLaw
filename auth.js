function openRegister(){
  const email=prompt("Enter Email:");
  const pass=prompt("Enter Password:");
  if(!email.includes("@")) return alert("Invalid Email");

  const users=JSON.parse(localStorage.getItem("users")||"[]");
  users.push({email,pass,role:"user"});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registered successfully");
}

function openLogin(){
  const email=prompt("Email:");
  const pass=prompt("Password:");
  const users=JSON.parse(localStorage.getItem("users")||"[]");

  const user=users.find(u=>u.email===email && u.pass===pass);
  if(!user) return alert("Invalid credentials");

  localStorage.setItem("loggedInUser",JSON.stringify(user));
  alert("Login successful");
}

function goAdmin(){
  const user=JSON.parse(localStorage.getItem("loggedInUser"));
  if(user && user.role==="admin"){
    location.href="admin.html";
  }else{
    alert("Admin access only");
  }
}
function openAuth(type){
  const email=prompt("Enter email:");
  const password=prompt("Enter password:");
  
  if(type==="signup"){
    localStorage.setItem("sealaw_user",JSON.stringify({email,password,role:"user"}));
    alert("Account created");
  }else{
    const user=JSON.parse(localStorage.getItem("sealaw_user"));
    if(user && user.email===email && user.password===password){
      alert("Login successful");
    }else{
      alert("Invalid credentials");
    }
  }
}
