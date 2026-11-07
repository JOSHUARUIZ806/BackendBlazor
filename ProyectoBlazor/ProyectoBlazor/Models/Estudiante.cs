using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("estudiante")]
    public class Estudiante
    {
        [Key]
        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("nombre")]
        [MaxLength(80)]
        public string Nombre { get; set; } = string.Empty;

        [Column("apellido_paterno")]
        [MaxLength(80)]
        public string ApellidoPaterno { get; set; } = string.Empty;

        [Column("apellido_materno")]
        [MaxLength(80)]
        public string? ApellidoMaterno { get; set; }

        [Column("matricula")]
        [MaxLength(20)]
        public string Matricula { get; set; } = string.Empty;

        [Column("carrera")]
        [MaxLength(120)]
        public string Carrera { get; set; } = string.Empty;

        [Column("correo_electronico")]
        [MaxLength(150)]
        public string CorreoElectronico { get; set; } = string.Empty;

        [Column("contrasena")]
        [MaxLength(255)]
        public string Contrasena { get; set; } = string.Empty;

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public ICollection<GrupoEstudiante> GruposEstudiantes { get; set; } = new List<GrupoEstudiante>();
        public ICollection<ResultadoAtencion> ResultadosAtencion { get; set; } = new List<ResultadoAtencion>();
        public ICollection<ResultadoMemorama> ResultadosMemorama { get; set; } = new List<ResultadoMemorama>();
        public ICollection<ResultadoSucesiones> ResultadosSucesiones { get; set; } = new List<ResultadoSucesiones>();
        public ICollection<ResultadoTestTrazo> ResultadosTestTrazo { get; set; } = new List<ResultadoTestTrazo>();
    }
}

