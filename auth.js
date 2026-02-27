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
