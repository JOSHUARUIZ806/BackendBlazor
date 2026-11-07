using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("grupo_estudiante")]
    public class GrupoEstudiante
    {
        [Key]
        [Column("id_grupo_estudiante")]
        public int IdGrupoEstudiante { get; set; }

        [Column("id_grupo")]
        public int IdGrupo { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("fecha_inscripcion")]
        public DateTime FechaInscripcion { get; set; } = DateTime.Now;

        [ForeignKey(nameof(IdGrupo))]
        public Grupo? Grupo { get; set; }

        [ForeignKey(nameof(IdEstudiante))]
        public Estudiante? Estudiante { get; set; }
    }
}

