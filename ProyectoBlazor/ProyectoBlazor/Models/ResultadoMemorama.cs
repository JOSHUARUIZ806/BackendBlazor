using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("resultado_memorama")]
    public class ResultadoMemorama
    {
        [Key]
        [Column("id_resultado")]
        public int IdResultado { get; set; }

        [Column("id_estudiante")]
        public int IdEstudiante { get; set; }

        [Column("id_grupo")]
        public int? IdGrupo { get; set; }

        [Column("pares_encontrados")]
        public int ParesEncontrados { get; set; }

        [Column("total_pares")]
        public int TotalPares { get; set; }

        [Column("movimientos")]
        public int Movimientos { get; set; }

        [Column("errores")]
        public int Errores { get; set; }

        [Column("precision_porcentaje", TypeName = "decimal(5,2)")]
        public decimal PrecisionPorcentaje { get; set; }

        [Column("tiempo_segundos")]
        public int TiempoSegundos { get; set; }

        [Column("rating_estrellas")]
        public int RatingEstrellas { get; set; }

        [Column("fecha_partida")]
        public DateTime FechaPartida { get; set; } = DateTime.Now;

        [ForeignKey(nameof(IdEstudiante))]
        public Estudiante? Estudiante { get; set; }

        [ForeignKey(nameof(IdGrupo))]
        public Grupo? Grupo { get; set; }
    }
}

