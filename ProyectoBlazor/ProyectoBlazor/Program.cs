using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProyectoBlazor.Data;
using ProyectoBlazor.Models;
using ProyectoBlazor.Components;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("MiConexionSQL")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

// ============================================================
// ENDPOINTS API CONECTADOS A SQL SERVER
// ============================================================

static async Task<object> ConstruirResumenEstudianteAsync(ApplicationDbContext db, int idEstudiante)
{
    var mem = await db.ResultadosMemorama
        .Where(r => r.IdEstudiante == idEstudiante)
        .OrderByDescending(r => r.FechaPartida)
        .FirstOrDefaultAsync();

    var ate = await db.ResultadosAtencion
        .Where(r => r.IdEstudiante == idEstudiante)
        .OrderByDescending(r => r.FechaPartida)
        .FirstOrDefaultAsync();

    var suc = await db.ResultadosSucesiones
        .Where(r => r.IdEstudiante == idEstudiante)
        .OrderByDescending(r => r.FechaPartida)
        .FirstOrDefaultAsync();

    var tra = await db.ResultadosTestTrazo
        .Where(r => r.IdEstudiante == idEstudiante)
        .OrderByDescending(r => r.FechaPartida)
        .FirstOrDefaultAsync();

    object? objMem = mem == null ? null : new
    {
        puntaje = mem.TotalPares > 0
            ? (int)Math.Round((double)mem.ParesEncontrados / mem.TotalPares * 100.0)
            : (int)Math.Round(mem.PrecisionPorcentaje),
        precision_pct = mem.PrecisionPorcentaje,
        tiempo_ms = mem.TiempoSegundos * 1000,
        errores = mem.Errores,
        creado_en = mem.FechaPartida
    };

    object? objAte = ate == null ? null : new
    {
        puntaje = ate.TotalRondas > 0
            ? (int)Math.Round((double)ate.Aciertos / ate.TotalRondas * 100.0)
            : (int)Math.Round(ate.PrecisionPorcentaje),
        precision_pct = ate.PrecisionPorcentaje,
        errores = ate.Errores,
        creado_en = ate.FechaPartida
    };

    object? objSuc = suc == null ? null : new
    {
        puntaje = suc.TotalPruebas > 0
            ? (int)Math.Round((double)suc.RespuestasCorrectas / suc.TotalPruebas * 100.0)
            : 0,
        precision_pct = suc.TotalPruebas > 0
            ? Math.Round((decimal)suc.RespuestasCorrectas / suc.TotalPruebas * 100m, 2)
            : 0m,
        tiempo_ms = suc.TiempoTotalMs,
        errores = suc.RespuestasIncorrectas,
        creado_en = suc.FechaPartida
    };

    object? objTra = tra == null ? null : new
    {
        puntaje = (int)Math.Round(tra.PrecisionPorcentaje),
        precision_pct = tra.PrecisionPorcentaje,
        tiempo_ms = tra.TiempoTotalMs,
        errores = tra.Errores,
        creado_en = tra.FechaPartida
    };

    return new
    {
        memoria = objMem,
        atencion = objAte,
        razonamiento = objSuc,
        velocidad = objTra
    };
}

app.MapPost("/api/grupos/generar", async (GenerarGrupoDto? dto, ApplicationDbContext db) =>
{
    int idDocente = dto?.DocenteId ?? 0;
    Docente? docente = null;
    if (idDocente > 0)
        docente = await db.Docentes.FindAsync(idDocente);
    docente ??= await db.Docentes.OrderBy(d => d.IdDocente).FirstOrDefaultAsync();

    if (docente == null)
        return Results.BadRequest(new { ok = false, error = "No existe ningún docente registrado en la base de datos." });

    const string caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    string codigo;
    do
    {
        var chars = new char[6];
        for (int i = 0; i < 6; i++)
            chars[i] = caracteres[RandomNumberGenerator.GetInt32(caracteres.Length)];
        codigo = new string(chars);
    } while (await db.Grupos.AnyAsync(g => g.CodigoGrupo == codigo));

    var nuevoGrupo = new Grupo
    {
        IdDocente = docente.IdDocente,
        CodigoGrupo = codigo,
        NombreGrupo = $"Grupo {codigo}",
        Descripcion = "Grupo generado desde el panel de docente",
        FechaCreacion = DateTime.Now,
        Activo = true
    };

    db.Grupos.Add(nuevoGrupo);
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        ok = true,
        grupo = new
        {
            id = nuevoGrupo.IdGrupo,
            codigo = nuevoGrupo.CodigoGrupo,
            nombre = nuevoGrupo.NombreGrupo,
            creado_en = nuevoGrupo.FechaCreacion
        }
    });
});

app.MapGet("/api/grupos/{codigo}", async (string codigo, ApplicationDbContext db) =>
{
    var codigoLimpio = codigo.Trim().ToUpperInvariant();
    var grupo = await db.Grupos.FirstOrDefaultAsync(g => g.CodigoGrupo.ToUpper() == codigoLimpio && g.Activo);
    if (grupo == null)
        return Results.NotFound(new { ok = false, error = "Grupo no encontrado en la base de datos." });

    var inscripciones = await db.GruposEstudiantes
        .Include(ge => ge.Estudiante)
        .Where(ge => ge.IdGrupo == grupo.IdGrupo)
        .OrderBy(ge => ge.FechaInscripcion)
        .ToListAsync();

    var listaEstudiantes = new List<object>();
    foreach (var insc in inscripciones)
    {
        if (insc.Estudiante == null) continue;
        var e = insc.Estudiante;
        var partesNombre = new List<string> { e.Nombre };
        if (!string.IsNullOrWhiteSpace(e.ApellidoPaterno) && e.ApellidoPaterno != "-") partesNombre.Add(e.ApellidoPaterno);
        if (!string.IsNullOrWhiteSpace(e.ApellidoMaterno)) partesNombre.Add(e.ApellidoMaterno);
        var nombreCompleto = string.Join(' ', partesNombre);

        var resumen = await ConstruirResumenEstudianteAsync(db, e.IdEstudiante);
        listaEstudiantes.Add(new
        {
            estudiante = new
            {
                id = e.IdEstudiante,
                nombre = nombreCompleto,
                matricula = e.Matricula,
                correo = e.CorreoElectronico
            },
            resumen
        });
    }

    return Results.Ok(new
    {
        ok = true,
        grupo = new
        {
            id = grupo.IdGrupo,
            codigo = grupo.CodigoGrupo,
            nombre = grupo.NombreGrupo
        },
        estudiantes = listaEstudiantes
    });
});

app.MapPost("/api/grupos/unirse", async (UnirseGrupoDto dto, ApplicationDbContext db) =>
{
    if (dto.EstudianteId <= 0 || string.IsNullOrWhiteSpace(dto.Codigo))
        return Results.BadRequest(new { ok = false, error = "Datos incompletos." });

    var codigoLimpio = dto.Codigo.Trim().ToUpperInvariant();
    var grupo = await db.Grupos.FirstOrDefaultAsync(g => g.CodigoGrupo.ToUpper() == codigoLimpio && g.Activo);
    if (grupo == null)
        return Results.NotFound(new { ok = false, error = "No se encontró ningún grupo activo con ese código." });

    var yaInscrito = await db.GruposEstudiantes
        .AnyAsync(ge => ge.IdGrupo == grupo.IdGrupo && ge.IdEstudiante == dto.EstudianteId);

    if (!yaInscrito)
    {
        db.GruposEstudiantes.Add(new GrupoEstudiante
        {
            IdGrupo = grupo.IdGrupo,
            IdEstudiante = dto.EstudianteId,
            FechaInscripcion = DateTime.Now
        });
        await db.SaveChangesAsync();
    }

    return Results.Ok(new { ok = true, codigo = grupo.CodigoGrupo, nombre = grupo.NombreGrupo });
});

app.MapGet("/api/estudiantes/{id:int}/resumen", async (int id, ApplicationDbContext db) =>
{
    var estudiante = await db.Estudiantes.FindAsync(id);
    if (estudiante == null)
        return Results.NotFound(new { ok = false, error = "Estudiante no encontrado." });

    var inscripcion = await db.GruposEstudiantes
        .Include(ge => ge.Grupo)
        .Where(ge => ge.IdEstudiante == id)
        .OrderByDescending(ge => ge.FechaInscripcion)
        .FirstOrDefaultAsync();

    var resumen = await ConstruirResumenEstudianteAsync(db, id);
    return Results.Ok(new
    {
        ok = true,
        grupoCodigo = inscripcion?.Grupo?.CodigoGrupo,
        resumen
    });
});

app.MapPost("/api/resultados", async (GuardarResultadoDto dto, ApplicationDbContext db) =>
{
    if (dto.EstudianteId <= 0 || string.IsNullOrWhiteSpace(dto.Prueba))
        return Results.BadRequest(new { ok = false, error = "Datos de resultado inválidos." });

    var estudianteExiste = await db.Estudiantes.AnyAsync(e => e.IdEstudiante == dto.EstudianteId);
    if (!estudianteExiste)
        return Results.NotFound(new { ok = false, error = "Estudiante no encontrado en la base de datos." });

    var inscripcion = await db.GruposEstudiantes
        .Where(ge => ge.IdEstudiante == dto.EstudianteId)
        .OrderByDescending(ge => ge.FechaInscripcion)
        .FirstOrDefaultAsync();

    int? idGrupo = inscripcion?.IdGrupo;
    var prueba = dto.Prueba.Trim().ToLowerInvariant();

    switch (prueba)
    {
        case "memoria":
        {
            int paresEncontrados = 0;
            int totalPares = 52;
            if (dto.Detalle.HasValue && dto.Detalle.Value.ValueKind == JsonValueKind.Object &&
                dto.Detalle.Value.TryGetProperty("fases", out var fasesEl) && fasesEl.ValueKind == JsonValueKind.Array)
            {
                int sumaEncontrados = 0;
                int sumaTotales = 0;
                foreach (var f in fasesEl.EnumerateArray())
                {
                    if (f.TryGetProperty("paresEncontrados", out var pe)) sumaEncontrados += pe.GetInt32();
                    if (f.TryGetProperty("paresTotales", out var pt)) sumaTotales += pt.GetInt32();
                }
                if (sumaTotales > 0)
                {
                    paresEncontrados = sumaEncontrados;
                    totalPares = sumaTotales;
                }
            }
            if (paresEncontrados == 0 && dto.Puntaje > 0)
                paresEncontrados = (int)Math.Round(dto.Puntaje * totalPares / 100.0);

            int estrellas = dto.Puntaje >= 85 ? 3 : (dto.Puntaje >= 60 ? 2 : 1);

            db.ResultadosMemorama.Add(new ResultadoMemorama
            {
                IdEstudiante = dto.EstudianteId,
                IdGrupo = idGrupo,
                ParesEncontrados = paresEncontrados,
                TotalPares = totalPares,
                Movimientos = paresEncontrados + dto.Errores,
                Errores = dto.Errores,
                PrecisionPorcentaje = Math.Clamp(dto.PrecisionPct, 0m, 100m),
                TiempoSegundos = Math.Max(0, (int)Math.Round(dto.TiempoMs / 1000.0)),
                RatingEstrellas = estrellas,
                FechaPartida = DateTime.Now
            });
            await db.SaveChangesAsync();
            break;
        }

        case "atencion":
        {
            int totalRondas = 45;
            int aciertos = (int)Math.Round(dto.Puntaje * totalRondas / 100.0);
            string evaluacion = dto.PrecisionPct >= 90
                ? "Control Inhibitorio Excelente"
                : (dto.PrecisionPct >= 70 ? "Buena Concentración y Flexibilidad" : "Predominancia de Lectura Automática");

            var resultadoAtencion = new ResultadoAtencion
            {
                IdEstudiante = dto.EstudianteId,
                IdGrupo = idGrupo,
                TotalRondas = totalRondas,
                Aciertos = aciertos,
                Errores = dto.Errores,
                PrecisionPorcentaje = Math.Clamp(dto.PrecisionPct, 0m, 100m),
                Evaluacion = evaluacion,
                FechaPartida = DateTime.Now
            };

            db.ResultadosAtencion.Add(resultadoAtencion);
            await db.SaveChangesAsync();

            if (dto.Detalle.HasValue && dto.Detalle.Value.ValueKind == JsonValueKind.Object &&
                dto.Detalle.Value.TryGetProperty("rondas", out var rondasEl) && rondasEl.ValueKind == JsonValueKind.Array)
            {
                int numRonda = 1;
                foreach (var r in rondasEl.EnumerateArray())
                {
                    db.DetallesRondasAtencion.Add(new DetalleRondaAtencion
                    {
                        IdResultado = resultadoAtencion.IdResultado,
                        NumeroRonda = r.TryGetProperty("numeroRonda", out var nr) ? nr.GetInt32() : numRonda,
                        PalabraMostrada = r.TryGetProperty("palabraMostrada", out var pm) ? (pm.GetString() ?? "") : "",
                        ColorTinta = r.TryGetProperty("colorTinta", out var ct) ? (ct.GetString() ?? "") : "",
                        ColorElegido = r.TryGetProperty("colorElegido", out var ce) ? (ce.GetString() ?? "") : "",
                        EsCorrecto = r.TryGetProperty("esCorrecto", out var ec) && ec.GetBoolean(),
                        TiempoReaccionMs = r.TryGetProperty("tiempoReaccionMs", out var tr) ? tr.GetInt32() : 0
                    });
                    numRonda++;
                }
                await db.SaveChangesAsync();
            }
            break;
        }

        case "razonamiento":
        {
            int totalPruebas = 15;
            int correctas = (int)Math.Round(dto.Puntaje * totalPruebas / 100.0);

            db.ResultadosSucesiones.Add(new ResultadoSucesiones
            {
                IdEstudiante = dto.EstudianteId,
                IdGrupo = idGrupo,
                TotalPruebas = totalPruebas,
                RespuestasCorrectas = correctas,
                RespuestasIncorrectas = dto.Errores,
                TiempoTotalMs = Math.Max(0, dto.TiempoMs),
                DetallePruebas = dto.Detalle.HasValue ? dto.Detalle.Value.GetRawText() : null,
                FechaPartida = DateTime.Now
            });
            await db.SaveChangesAsync();
            break;
        }

        case "velocidad":
        {
            int totalCirculos = 40;
            var ahora = DateTime.Now;
            var inicio = ahora.AddMilliseconds(-Math.Max(0, dto.TiempoMs));

            db.ResultadosTestTrazo.Add(new ResultadoTestTrazo
            {
                IdEstudiante = dto.EstudianteId,
                IdGrupo = idGrupo,
                TotalCirculos = totalCirculos,
                Aciertos = totalCirculos,
                Errores = dto.Errores,
                PrecisionPorcentaje = Math.Clamp((decimal)dto.Puntaje, 0m, 100m),
                TiempoTotalMs = Math.Max(0, dto.TiempoMs),
                HoraInicio = inicio.TimeOfDay,
                HoraFin = ahora.TimeOfDay,
                FechaPartida = ahora
            });
            await db.SaveChangesAsync();
            break;
        }

        default:
            return Results.BadRequest(new { ok = false, error = "Tipo de prueba no reconocido." });
    }

    return Results.Ok(new { ok = true });
});

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();

public record GenerarGrupoDto(int? DocenteId);
public record UnirseGrupoDto(int EstudianteId, string Codigo);
public record GuardarResultadoDto(
    int EstudianteId,
    string Prueba,
    double Puntaje,
    decimal PrecisionPct,
    int TiempoMs,
    int Errores,
    JsonElement? Detalle);
