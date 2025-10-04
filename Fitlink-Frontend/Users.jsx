import React, { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({
    id: "",
    nombre: "",
    biografia: "",
    fechaNacimiento: "",
    ciudad: "",
    foto: "",
  });
  const [message, setMessage] = useState("");
  const [sortField, setSortField] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      const updatedUsers = users.filter((user) => user.id !== id);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      showMessage("Usuario eliminado correctamente ✅");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditData(user);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    const updatedUsers = users.map((user) =>
      user.id === editingUser ? editData : user
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setEditingUser(null);
    showMessage("Usuario actualizado con éxito ✅");
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedUsers = [...users].sort((a, b) => {
      if (field === "fechaNacimiento") {
        return order === "asc"
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      return order === "asc"
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    });

    setUsers(sortedUsers);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Usuarios Registrados</h2>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-500">No hay usuarios registrados todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th
                  className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("nombre")}
                >
                  Nombre {sortField === "nombre" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 border">Biografía</th>
                <th
                  className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort("fechaNacimiento")}
                >
                  Fecha de Nacimiento{" "}
                  {sortField === "fechaNacimiento" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 border">Ciudad</th>
                <th className="px-4 py-2 border">Foto</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="text-center">
                  {editingUser === user.id ? (
                    <>
                      <td className="px-4 py-2 border">{user.id}</td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          name="nombre"
                          value={editData.nombre}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <textarea
                          name="biografia"
                          value={editData.biografia}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="date"
                          name="fechaNacimiento"
                          value={editData.fechaNacimiento}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          name="ciudad"
                          value={editData.ciudad}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full text-sm"
                        />
                        {editData.foto && (
                          <img
                            src={editData.foto}
                            alt="Perfil"
                            className="w-12 h-12 rounded-full object-cover mx-auto mt-2"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 border space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 border">{user.id}</td>
                      <td className="px-4 py-2 border">{user.nombre}</td>
                      <td className="px-4 py-2 border">{user.biografia}</td>
                      <td className="px-4 py-2 border">{user.fechaNacimiento}</td>
                      <td className="px-4 py-2 border">{user.ciudad}</td>
                      <td className="px-4 py-2 border text-center">
                        {user.foto ? (
                          <img
                            src={user.foto}
                            alt="Perfil"
                            className="w-12 h-12 rounded-full object-cover mx-auto"
                          />
                        ) : (
                          "Sin foto"
                        )}
                      </td>
                      <td className="px-4 py-2 border space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
