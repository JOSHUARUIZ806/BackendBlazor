using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("resultado_sucesiones")]
    public class ResultadoSucesiones
    {
        [Key]
        [Column("id_resultado")]
        public int IdResultado { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("id_grupo")]
        public int? IdGrupo { get; set; }

        [Column("total_pruebas")]
        public int TotalPruebas { get; set; }

        [Column("respuestas_correctas")]
        public int RespuestasCorrectas { get; set; }

        [Column("respuestas_incorrectas")]
        public int RespuestasIncorrectas { get; set; }

        [Column("tiempo_total_ms")]
        public int TiempoTotalMs { get; set; }

        [Column("detalle_pruebas")]
        public string? DetallePruebas { get; set; }

        [Column("fecha_partida")]
        public DateTime FechaPartida { get; set; } = DateTime.Now;

        [ForeignKey(nameof(IdEstudiante))]
        public Estudiante? Estudiante { get; set; }

        [ForeignKey(nameof(IdGrupo))]
        public Grupo? Grupo { get; set; }
    }
}

