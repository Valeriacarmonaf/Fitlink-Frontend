
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({
    nombre: "",
    biografia: "",
    fecha_nacimiento: "",
    municipio: "",
    foto_url: "",
  });
  const [message, setMessage] = useState("");
  const [sortField, setSortField] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Cargar usuarios desde el backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.users.list();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // 🔹 Eliminar usuario
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await api.users.remove(id);
      showMessage("Usuario eliminado ✅");
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError("No se pudo eliminar el usuario");
    }
  };

  // 🔹 Editar usuario
  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditData({
      nombre: user.nombre,
      biografia: user.biografia,
      fecha_nacimiento: user.fecha_nacimiento,
      municipio: user.municipio,
      foto_url: user.foto_url,
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditData({ ...editData, foto_url: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    try {
      await api.users.update(editingUser, editData);
      showMessage("Usuario actualizado ✅");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Error al actualizar usuario");
    }
  };

  const handleCancelEdit = () => setEditingUser(null);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    const sorted = [...users].sort((a, b) => {
      if (field === "fecha_nacimiento") {
        return order === "asc"
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }
      return order === "asc"
        ? a[field]?.localeCompare(b[field] || "")
        : b[field]?.localeCompare(a[field] || "");
    });
    setUsers(sorted);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Usuarios Registrados</h2>

      {message && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Cargando usuarios...</p>
      ) : users.length === 0 ? (
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
                  onClick={() => handleSort("fecha_nacimiento")}
                >
                  Fecha de Nacimiento{" "}
                  {sortField === "fecha_nacimiento" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-2 border">Municipio</th>
                <th className="px-4 py-2 border">Foto</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="text-center">
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
                          name="fecha_nacimiento"
                          value={editData.fecha_nacimiento}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input
                          type="text"
                          name="municipio"
                          value={editData.municipio}
                          onChange={handleEditChange}
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border">
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        {editData.foto_url && (
                          <img
                            src={editData.foto_url}
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
                      <td className="px-4 py-2 border">{user.fecha_nacimiento}</td>
                      <td className="px-4 py-2 border">{user.municipio}</td>
                      <td className="px-4 py-2 border">
                        {user.foto_url ? (
                          <img
                            src={user.foto_url}
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