using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("resultado_atencion")]
    public class ResultadoAtencion
    {
        [Key]
        [Column("id_resultado")]
        public int IdResultado { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("id_grupo")]
        public int? IdGrupo { get; set; }

        [Column("total_rondas")]
        public int TotalRondas { get; set; }

        [Column("aciertos")]
        public int Aciertos { get; set; }

        [Column("errores")]
        public int Errores { get; set; }

        [Column("precision_porcentaje", TypeName = "decimal(5,2)")]
        public decimal PrecisionPorcentaje { get; set; }

        [Column("evaluacion")]
        [MaxLength(60)]
        public string? Evaluacion { get; set; }

        [Column("fecha_partida")]
        public DateTime FechaPartida { get; set; } = DateTime.Now;

        [ForeignKey(nameof(IdEstudiante))]
        public Estudiante? Estudiante { get; set; }

        [ForeignKey(nameof(IdGrupo))]
        public Grupo? Grupo { get; set; }

        public ICollection<DetalleRondaAtencion> DetallesRondas { get; set; } = new List<DetalleRondaAtencion>();
    }
}

