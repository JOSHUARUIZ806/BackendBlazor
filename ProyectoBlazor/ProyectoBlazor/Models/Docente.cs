using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("docente")]
    public class Docente
    {
        // 1. Clave primaria (Primary Key)
        [Key]
        [Column("id_docente")]
        public int IdDocente { get; set; }

        // 2. Datos personales obligatorios (NOT NULL en SQL)
        [Column("nombre")]
        [MaxLength(80)]
        public string Nombre { get; set; } = string.Empty;

        [Column("apellido_paterno")]
        [MaxLength(80)]
        public string ApellidoPaterno { get; set; } = string.Empty;

        [Column("apellido_materno")]
        [MaxLength(80)]
        public string? ApellidoMaterno { get; set; }

        [Column("numero_empleado")]
        [MaxLength(20)]
        public string NumeroEmpleado { get; set; } = string.Empty;

        [Column("carrera")]
        [MaxLength(120)]
        public string Carrera { get; set; } = string.Empty;

        // 4. Credenciales de acceso
        [Column("correo_electronico")]
        [MaxLength(150)]
        public string CorreoElectronico { get; set; } = string.Empty;

        [Column("contrasena")]
        [MaxLength(255)]
        public string Contrasena { get; set; } = string.Empty;

        // 5. Fecha de registro (por defecto la fecha actual)
        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        // 6. Propiedad de navegación (Relación 1 a Muchos con Grupo)
        // Un docente puede tener una lista de muchos grupos a su cargo
        public ICollection<Grupo> Grupos { get; set; } = new List<Grupo>();
    }
}
