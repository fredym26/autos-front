import React, { useState, FormEvent, useRef } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";

type Props = {};

const RegistrarUsuario = (props: Props) => {
  const [nombre, setNombre] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("ROLE_USER");
  const [contraseña, setContraseña] = useState("");
  const toast = useRef<Toast>(null);
  const navigate = useNavigate(); 

  const roles = [
    { label: "Usuario", value: "ROLE_USER" },
    { label: "Administrador", value: "ROLE_ADMIN" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const nuevoUsuario = {
        nombre,
        nombreUsuario,
        email,
        rol,
        contraseña,
      };

      const response = await axios.post(
        "http://localhost:8080/autenticar/guardarUsuario",
        nuevoUsuario,
      );

      const { resultado, notificacion } = response.data;

      if (resultado) {
        toast.current?.show({
          severity: "success",
          summary: "Registro exitoso",
          detail: notificacion,
          life: 3000,
        });

        // Limpieza del formulario
        setNombre("");
        setNombreUsuario("");
        setEmail("");
        setRol("ROLE_USER");
        setContraseña("");
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error al registrar",
          detail: notificacion,
          life: 3000,
        });
      }
    } catch (err: any) {
      // Si el backend devuelve 401, 201 o error, procesamos el objeto en err.response.data
      if (err.response?.data) {
        const { notificacion, codigo } = err.response.data;
        toast.current?.show({
          severity: "error",
          summary: `Error ${codigo}`,
          detail: notificacion || "Error en el registro",
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
        background: "linear-gradient(135deg, #4f46e5, #c8f55e)",
      }}
    >
      <Toast ref={toast} />
      <Card
        title="Registrar Usuario"
        style={{ width: "450px", color: "#000a02", fontWeight: "bold" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <Button
            label="Inicio"
            type="button"
            icon="pi pi-home"
            className="p-button-rounded p-button-info" // verde llamativo
            onClick={() => navigate("/")}
            tooltip="Volver al login"
            style={{height: "24px"}}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field">
            <label
              htmlFor="nombre"
              style={{ color: "#204066", fontWeight: "bold" }}
            >
              Nombre
            </label>
            <InputText
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="field">
            <label
              htmlFor="nombreUsuario"
              style={{ color: "#204066", fontWeight: "bold" }}
            >
              Nombre de Usuario
            </label>
            <InputText
              id="nombreUsuario"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
            />
          </div>
          <div className="field">
            <label
              htmlFor="email"
              style={{ color: "#204066", fontWeight: "bold" }}
            >
              Email
            </label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label
              htmlFor="rol"
              style={{ color: "#204066", fontWeight: "bold" }}
            >
              Rol
            </label>
            <Dropdown
              id="rol"
              value={rol}
              options={roles}
              onChange={(e) => setRol(e.value)}
            />
          </div>
          <div className="field">
            <label
              htmlFor="contraseña"
              style={{ color: "#204066", fontWeight: "bold" }}
            >
              Contraseña
            </label>
            <Password
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              feedback={false}
              toggleMask
            />
          </div>
          <br></br>
          <Button
            type="submit"
            label="Guardar"
            icon="pi pi-play"
            className="mt-3"
            severity="warning"
            style={{
              width: "180px",
              height: "40px",
              fontSize: "16px",
              padding: "4px 8px",
            }}
          />
        </form>
      </Card>
    </div>
  );
};

export default RegistrarUsuario;
