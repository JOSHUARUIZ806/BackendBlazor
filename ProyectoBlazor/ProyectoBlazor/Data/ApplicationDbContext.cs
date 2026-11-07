using Microsoft.EntityFrameworkCore;
using ProyectoBlazor.Models;

namespace ProyectoBlazor.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Cada "DbSet" representa una tabla de tu base de datos
        public DbSet<Docente> Docentes => Set<Docente>();
        public DbSet<Estudiante> Estudiantes => Set<Estudiante>();
        public DbSet<Grupo> Grupos => Set<Grupo>();
        public DbSet<GrupoEstudiante> GruposEstudiantes => Set<GrupoEstudiante>();
        public DbSet<ResultadoAtencion> ResultadosAtencion => Set<ResultadoAtencion>();
        public DbSet<DetalleRondaAtencion> DetallesRondasAtencion => Set<DetalleRondaAtencion>();
        public DbSet<ResultadoSucesiones> ResultadosSucesiones => Set<ResultadoSucesiones>();
        public DbSet<ResultadoMemorama> ResultadosMemorama => Set<ResultadoMemorama>();
        public DbSet<ResultadoTestTrazo> ResultadosTestTrazo => Set<ResultadoTestTrazo>();

        // Configuración de tablas, claves primarias, índices únicos y llaves foráneas (Fluent API)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Docente>(entity =>
            {
                entity.ToTable("docente");
                entity.HasKey(e => e.IdDocente);
                entity.HasIndex(e => e.CorreoElectronico).IsUnique();
                entity.HasIndex(e => e.NumeroEmpleado).IsUnique();
            });

            modelBuilder.Entity<Estudiante>(entity =>
            {
                entity.ToTable("estudiante");
                entity.HasKey(e => e.IdEstudiante);
                entity.HasIndex(e => e.CorreoElectronico).IsUnique();
                entity.HasIndex(e => e.Matricula).IsUnique();
            });

            modelBuilder.Entity<Grupo>(entity =>
            {
                entity.ToTable("grupo");
                entity.HasKey(e => e.IdGrupo);
                entity.HasIndex(e => e.CodigoGrupo).IsUnique();
                entity.HasOne(e => e.Docente)
                      .WithMany(d => d.Grupos)
                      .HasForeignKey(e => e.IdDocente)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GrupoEstudiante>(entity =>
            {
                entity.ToTable("grupo_estudiante");
                entity.HasKey(e => e.IdGrupoEstudiante);
                entity.HasIndex(e => new { e.IdGrupo, e.IdEstudiante }).IsUnique();
                entity.HasOne(e => e.Grupo)
                      .WithMany(g => g.GruposEstudiantes)
                      .HasForeignKey(e => e.IdGrupo)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Estudiante)
                      .WithMany(s => s.GruposEstudiantes)
                      .HasForeignKey(e => e.IdEstudiante)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<ResultadoAtencion>(entity =>
            {
                entity.ToTable("resultado_atencion");
                entity.HasKey(e => e.IdResultado);
                entity.HasOne(e => e.Estudiante)
                      .WithMany(s => s.ResultadosAtencion)
                      .HasForeignKey(e => e.IdEstudiante)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Grupo)
                      .WithMany(g => g.ResultadosAtencion)
                      .HasForeignKey(e => e.IdGrupo)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<DetalleRondaAtencion>(entity =>
            {
                entity.ToTable("detalle_ronda_atencion");
                entity.HasKey(e => e.IdDetalle);
                entity.HasOne(e => e.ResultadoAtencion)
                      .WithMany(r => r.DetallesRondas)
                      .HasForeignKey(e => e.IdResultado)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ResultadoSucesiones>(entity =>
            {
                entity.ToTable("resultado_sucesiones");
                entity.HasKey(e => e.IdResultado);
                entity.HasOne(e => e.Estudiante)
                      .WithMany(s => s.ResultadosSucesiones)
                      .HasForeignKey(e => e.IdEstudiante)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Grupo)
                      .WithMany(g => g.ResultadosSucesiones)
                      .HasForeignKey(e => e.IdGrupo)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ResultadoMemorama>(entity =>
            {
                entity.ToTable("resultado_memorama");
                entity.HasKey(e => e.IdResultado);
                entity.HasOne(e => e.Estudiante)
                      .WithMany(s => s.ResultadosMemorama)
                      .HasForeignKey(e => e.IdEstudiante)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Grupo)
                      .WithMany(g => g.ResultadosMemorama)
                      .HasForeignKey(e => e.IdGrupo)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ResultadoTestTrazo>(entity =>
            {
                entity.ToTable("resultado_test_trazo");
                entity.HasKey(e => e.IdResultado);
                entity.HasOne(e => e.Estudiante)
                      .WithMany(s => s.ResultadosTestTrazo)
                      .HasForeignKey(e => e.IdEstudiante)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Grupo)
                      .WithMany(g => g.ResultadosTestTrazo)
                      .HasForeignKey(e => e.IdGrupo)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
