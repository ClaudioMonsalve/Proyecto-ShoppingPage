export default function Perfil({ usuario, imagenPerfil }) {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <h2>Perfil de Usuario</h2>
      <img src={imagenPerfil} alt="Perfil" style={{ width: '100px', borderRadius: '50%' }} />
      <p>Nombre: {usuario}</p>
      {/* Aquí después puedes agregar email, dirección, etc */}
    </div>
  )
}