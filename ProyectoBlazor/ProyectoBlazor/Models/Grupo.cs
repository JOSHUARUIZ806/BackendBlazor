using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("grupo")]
    public class Grupo
    {
        [Key]
        [Column("id_grupo")]
        public int IdGrupo { get; set; }

        [Column("id_docente")]
        public int IdDocente { get; set; }

        [Column("codigo_grupo")]
        [MaxLength(20)]
        public string CodigoGrupo { get; set; } = string.Empty;

        [Column("nombre_grupo")]
        [MaxLength(100)]
        public string NombreGrupo { get; set; } = string.Empty;

        [Column("descripcion")]
        [MaxLength(255)]
        public string? Descripcion { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [ForeignKey(nameof(IdDocente))]
        public Docente? Docente { get; set; }

        public ICollection<GrupoEstudiante> GruposEstudiantes { get; set; } = new List<GrupoEstudiante>();
        public ICollection<ResultadoAtencion> ResultadosAtencion { get; set; } = new List<ResultadoAtencion>();
        public ICollection<ResultadoMemorama> ResultadosMemorama { get; set; } = new List<ResultadoMemorama>();
        public ICollection<ResultadoSucesiones> ResultadosSucesiones { get; set; } = new List<ResultadoSucesiones>();
        public ICollection<ResultadoTestTrazo> ResultadosTestTrazo { get; set; } = new List<ResultadoTestTrazo>();
    }
}

