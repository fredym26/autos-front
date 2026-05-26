import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";


interface Auto {
  autoId: number;
  marca: string;
  modelo: string;
  anio: number;
  numeroPlaca: string;
  color: string;
  usuarioId: number;
}

interface UsuarioResponse {
  usuarioId: number;
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: string;
  fechaRegistro: string;
  autos: Auto[];
}

const Dashboard: React.FC = () => {

   const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
   const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);
   const [visible, setVisible] = useState(false);
   const [isNew, setIsNew] = useState(false);
   const [errors, setErrors] = useState<string[]>([]);
   const toast = useRef<Toast>(null);
   const navigate = useNavigate();  

  const fetchUsuario = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("idUsuario");

    if (token && userId) {
      console.log("Existe token y id" + token + " " + userId)
      axios
        .get<UsuarioResponse>(
          `http://localhost:8080/api/autos/obtenerUsuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setUsuario(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener datos:", error);
        });
    }
  };

   useEffect(() => {
    fetchUsuario();
  }, []);

  const editarAuto = (auto: Auto) => {
    setSelectedAuto({ ...auto });
    setVisible(true);
  };

  const nuevoAuto = () => {
    setSelectedAuto({
      autoId: 0,
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      numeroPlaca: "",
      color: "",
      usuarioId: Number(localStorage.getItem("idUsuario"))
    });
    setIsNew(true);
    setVisible(true);
  };

  const validar = (): boolean => {
    const errs: string[] = [];
    if (!selectedAuto?.marca) errs.push("La marca es obligatoria");
    if (!selectedAuto?.modelo) errs.push("El modelo es obligatorio");
    if (!selectedAuto?.anio || selectedAuto.anio < 1900)
      errs.push("El año debe ser válido");
    if (!selectedAuto?.numeroPlaca) errs.push("La placa es obligatoria");
    if (!selectedAuto?.color) errs.push("El color es obligatorio");

    setErrors(errs);
    return errs.length === 0;
  };

  const guardarAuto = async () => {
    if (!selectedAuto) return;
    if (!validar()) return;
    const token = localStorage.getItem("token");
    selectedAuto.usuarioId = Number(localStorage.getItem("idUsuario"));
    
    try {
    const response = await axios.post(
      "http://localhost:8080/api/autos/registrarAuto",
      selectedAuto,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );   
     const { resultado, notificacion } = response.data;  

        if(resultado){
        // Actualizar lista local
        if (usuario) {
          const autosActualizados = usuario.autos.map((a) =>
            a.autoId === selectedAuto.autoId ? selectedAuto : a
          );
          setUsuario({ ...usuario, autos: autosActualizados });
        }
        
       toast.current?.show({
          severity: "success",
          summary: "Correcto",
          detail: notificacion,
          life: 3000,
        });
        
        setVisible(false);
        fetchUsuario();
      }else{
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: notificacion ,
          life: 3000,
        });
      }
      }catch(error: any){
        console.error("Error al guardar auto:", error);
      }
  };

  const eliminarAuto = (id: number) => {
  const token = localStorage.getItem("token");
  axios
    .delete(`http://localhost:8080/api/autos/eliminarAuto/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      fetchUsuario(); // refresca la tabla
    })
    .catch((error) => console.error("Error al eliminar auto:", error));
};

  const accionesTemplate = (rowData: Auto) => {
    return (
      <div>
        <Button onClick={() => editarAuto(rowData)} severity="warning">Editar</Button>&nbsp;
        <Button onClick={() => eliminarAuto(rowData.autoId)} severity="danger" >Eliminar</Button>
      </div>
    );
  };

  



  return (
    <div
      style={{
        height: "100vh",      
        background: "linear-gradient(135deg, #efeff4, #187e3f)",
      }}
    >
      <h2>Bienvenido: {usuario?.nombre}</h2>      
     <div style={{ textAlign: "left" }}>

      <Button
              label="Login"
              type="button"
              icon="pi pi-home"
              className="p-button-rounded p-button-primary" 
              onClick={() => navigate("/")}
              tooltip="Volver al login"
              style={{height: "30px", marginBottom:"9px"}}
            />
  <Button label="Registrar auto" icon="pi pi-car" severity="warning" style={{height: "30px", marginBottom:"9px", marginLeft: "20px"}} onClick={nuevoAuto} />
  
 </div>
    
      
      <Toast ref={toast} />
      <div>
     
      <DataTable value={usuario?.autos || []} paginator rows={5}>
        <Column field="marca" header="Marca" />
        <Column field="modelo" header="Modelo" />
        <Column field="anio" header="Año" />
        <Column field="numeroPlaca" header="Placa" />
        <Column field="color" header="Color" />
        <Column  body={accionesTemplate} />
      </DataTable>
    </div>

      <Dialog
        header={isNew ? "Agregar Auto" : "Editar Auto"}
        visible={visible}
      
        onHide={() => setVisible(false)}
      >
         {errors.length > 0 &&
          errors.map((err, i) => (
            <Message key={i} severity="info" text={err} />
          ))}

        {selectedAuto && (
          <div className="p-fluid">
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Marca</label>
              <InputText
                value={selectedAuto.marca}
                onChange={(e) =>
                  setSelectedAuto({ ...selectedAuto, marca: e.target.value })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Modelo</label>
              <InputText
                value={selectedAuto.modelo}
                onChange={(e) =>
                  setSelectedAuto({ ...selectedAuto, modelo: e.target.value })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Año</label>
              <InputText
                value={selectedAuto.anio}
                onChange={(e) =>
                  setSelectedAuto({
                    ...selectedAuto,
                    anio: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Placa</label>
              <InputText
                value={selectedAuto.numeroPlaca}
                onChange={(e) =>
                  setSelectedAuto({
                    ...selectedAuto,
                    numeroPlaca: e.target.value,
                  })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Color</label>
              <InputText
                value={selectedAuto.color}
                onChange={(e) =>
                  setSelectedAuto({ ...selectedAuto, color: e.target.value })
                }
              />
            </div>
            <Button label="Guardar" icon="pi pi-save" onClick={guardarAuto}  style={{marginTop: "20px"}}/>
          </div>
        )}
      </Dialog>

    </div>
  );
};

export default Dashboard;
