import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",      
        background: "linear-gradient(135deg, #efeff4, #187e3f)",
      }}
    >
      <h1>Bienvenido</h1>
      <p style={{color:"black"}}>Aca podras gestionar tus autos</p>
    </div>
  );
};

export default Dashboard;
