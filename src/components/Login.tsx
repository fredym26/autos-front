import React, { useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";


/*interface LoginResponse {
  token: string;
  idUsuario: number;
  resultado: boolean;
  notificacion: string;
}*/

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useRef<Toast>(null);  
  const navigate = useNavigate();  
  

  
  const handleRegister = () => {
    // Aquí puedes redirigir a tu pantalla de registro
    window.location.href = "/register";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await axios.post("http://localhost:8080/autenticar/login", null, {
      params: {
        username: username,
        password: password,
      },
    });

    const { token, idUsuario, resultado, notificacion } = response.data;

    if (resultado && token) {
      localStorage.setItem("token", token);
      localStorage.setItem("idUsuario", idUsuario); 
           
      navigate("/dashboard");
    } else {        
        toast.current?.show({
          severity: "error",
          summary: "Error de autenticación",
          detail: notificacion || "Credenciales inválidas",
          life: 3000,
        });
      
      console.log(notificacion || "Error en autenticación");
    }
  } catch (err: any) {
    
    if (err.response && err.response.data) {
      const { notificacion } = err.response.data;
      toast.current?.show({
        severity: "info",
        summary: `Error`,
        detail: notificacion,
        life: 3000,
      });
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Error de conexión",
        detail: "No se pudo conectar con el servidor",
        life: 3000,
      });
    }
  }
};

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #4f46e5, #047a31)",
      }}
    >
         <Toast ref={toast} />
      <Card title="Iniciar Sesión" style={{ width: "400px", color: "#00050d", fontWeight: "bold" }}>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field">
            <label htmlFor="usuario" style={{ color: "#2f6acf", fontWeight: "bold" }}>Usuario</label>
            <InputText
              id="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nombre de usuario"
            />
          </div>
          <div className="field">
            <label htmlFor="password" style={{ color: "#2f6acf", fontWeight: "bold" }}>Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              placeholder="********"
            />
          </div>
          <br />
          <Button type="submit" label="Ingresar" icon="pi pi-globe" className="mt-3" />
          <Button
            type="button"
            label="Registrarse"
            icon="pi pi-user-plus"
            className="mt-3 p-button-warning"
            style={{marginTop: "10px"}}
            onClick={handleRegister}
            
          />
         
        </form>
      </Card>
    </div>
  );
};







export default Login;
