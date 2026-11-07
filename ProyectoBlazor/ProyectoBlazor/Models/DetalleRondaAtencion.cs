using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoBlazor.Models
{
    [Table("detalle_ronda_atencion")]
    public class DetalleRondaAtencion
    {
        [Key]
        [Column("id_detalle")]
        public int IdDetalle { get; set; }

        [Column("id_resultado")]
        public int IdResultado { get; set; }

        [Column("numero_ronda")]
        public int NumeroRonda { get; set; }

        [Column("palabra_mostrada")]
        [MaxLength(30)]
        public string PalabraMostrada { get; set; } = string.Empty;

        [Column("color_tinta")]
        [MaxLength(30)]
        public string ColorTinta { get; set; } = string.Empty;

        [Column("color_elegido")]
        [MaxLength(30)]
        public string ColorElegido { get; set; } = string.Empty;

        [Column("es_correcto")]
        public bool EsCorrecto { get; set; }

        [Column("tiempo_reaccion_ms")]
        public int TiempoReaccionMs { get; set; }

        [ForeignKey(nameof(IdResultado))]
        public ResultadoAtencion? ResultadoAtencion { get; set; }
    }
}

