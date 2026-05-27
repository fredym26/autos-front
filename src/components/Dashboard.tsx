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


interface Car {
  carId: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  userId: number;
}

interface UsuarioResponse {
  userId: number;
  fullName: string;
  userName: string;
  email: string;
  role: string;
  registrationDate: string;
  cars: Car[];
}

const Dashboard: React.FC = () => {

   const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
   const [selectedAuto, setSelectedAuto] = useState<Car | null>(null);
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
          `http://localhost:8080/api/cars/findUser/${userId}`,
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

  const editarAuto = (auto: Car) => {
    setSelectedAuto({ ...auto });
    setVisible(true);
  };

  const nuevoAuto = () => {
    setSelectedAuto({
      carId: 0,
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      license_plate: "",
      color: "",
      userId: Number(localStorage.getItem("idUsuario"))
    });
    setIsNew(true);
    setVisible(true);
  };

  const validar = (): boolean => {
    const errs: string[] = [];
    if (!selectedAuto?.brand) errs.push("La marca es obligatoria");
    if (!selectedAuto?.model) errs.push("El modelo es obligatorio");
    if (!selectedAuto?.year || selectedAuto.year < 1900)
      errs.push("El año debe ser válido");
    if (!selectedAuto?.license_plate) errs.push("La placa es obligatoria");
    if (!selectedAuto?.color) errs.push("El color es obligatorio");

    setErrors(errs);
    return errs.length === 0;
  };

  const guardarAuto = async () => {
    if (!selectedAuto) return;
    if (!validar()) return;
    const token = localStorage.getItem("token");
    selectedAuto.userId = Number(localStorage.getItem("idUsuario"));
    
    try {
    const response = await axios.post(
      "http://localhost:8080/api/cars/createCar",
      selectedAuto,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );   
     const { resultado, notificacion } = response.data;  

        if(resultado){
        // Actualizar lista local
        if (usuario) {
          const autosActualizados = usuario.cars.map((a) =>
            a.carId === selectedAuto.carId ? selectedAuto : a
          );
          setUsuario({ ...usuario, cars: autosActualizados });
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
    .delete(`http://localhost:8080/api/cars/deleteCar/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      fetchUsuario(); // refresca la tabla
    })
    .catch((error) => console.error("Error al eliminar auto:", error));
};

  const accionesTemplate = (rowData: Car) => {
    return (
      <div>
        <Button onClick={() => editarAuto(rowData)} severity="warning">Editar</Button>&nbsp;
        <Button onClick={() => eliminarAuto(rowData.carId)} severity="danger" >Eliminar</Button>
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
      <h2>Bienvenido: {usuario?.fullName}</h2>      
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
     
      <DataTable value={usuario?.cars || []} paginator rows={5}>
        <Column field="brand" header="Marca" />
        <Column field="model" header="Modelo" />
        <Column field="year" header="Año" />
        <Column field="license_plate" header="Placa" />
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
                value={selectedAuto.brand}
                onChange={(e) =>
                  setSelectedAuto({ ...selectedAuto, brand: e.target.value })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Modelo</label>
              <InputText
                value={selectedAuto.model}
                onChange={(e) =>
                  setSelectedAuto({ ...selectedAuto, model: e.target.value })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Año</label>
              <InputText
                value={selectedAuto.year}
                onChange={(e) =>
                  setSelectedAuto({
                    ...selectedAuto,
                    year: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="p-field">
              <label style={{ color: "#204066", fontWeight: "bold" }} >Placa</label>
              <InputText
                value={selectedAuto.license_plate}
                onChange={(e) =>
                  setSelectedAuto({
                    ...selectedAuto,
                    license_plate: e.target.value,
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
