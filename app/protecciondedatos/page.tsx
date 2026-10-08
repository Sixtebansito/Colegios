import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protección de Datos - COLEGIOS EVA',
  description: 'Política de Privacidad y Protección de Datos',
};

export default function ProteccionDeDatos() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium">
            &larr; Volver al inicio
          </Link>
        </div>

        <div className="bg-white p-8 md:p-12 shadow-sm rounded-xl border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b pb-4">
            POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS
          </h1>

          <div className="prose prose-blue max-w-none text-gray-700">
            <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
              <p className="mb-2"><strong>Entidad:</strong> Colegios EVA</p>
              <p className="mb-0"><strong>Sitio web:</strong> <a href="https://www.colegioseva.edu.ec" target="_blank" rel="noopener noreferrer" className="text-blue-600">www.colegioseva.edu.ec</a></p>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 mt-0">TABLA DE CONTENIDOS</h2>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 list-decimal list-inside text-blue-700">
                <li><a href="#informacion-responsable" className="hover:underline">Información sobre el responsable</a></li>
                <li><a href="#objetivo-alcance" className="hover:underline">Objetivo, alcance y finalidades</a></li>
                <li><a href="#datos-colectados" className="hover:underline">Datos colectados</a></li>
                <li><a href="#base-legal" className="hover:underline">Base legal para el tratamiento</a></li>
                <li><a href="#seguridad-datos" className="hover:underline">Seguridad y circulación de los datos</a></li>
                <li><a href="#derechos-titulares" className="hover:underline">Derecho de los titulares</a></li>
                <li><a href="#consultas" className="hover:underline">Consulta y soluciones</a></li>
                <li><a href="#definiciones" className="hover:underline">Definiciones y principios</a></li>
              </ol>
            </div>

            <section id="informacion-responsable" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Información sobre el responsable</h2>
              <h3 className="text-lg font-semibold mt-4 mb-2">Introducción</h3>
              <p>Colegios EVA es una red de instituciones educativas, enmarcada dentro del área de enseñanza en todos sus niveles; en sus modalidades Presencial y a Distancia.</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Objetivo</h3>
              <p>Dar cumplimiento al artículo 16, numerales 1 y 2 de la Constitución Política de Ecuador y al marco legislativo que regula la protección de datos personales (Ley Orgánica de Protección de Datos Personales de 2021, decreto ejecutivo 906 de noviembre de 2023 y demás normas).</p>
            </section>

            <section id="objetivo-alcance" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Objetivo, alcance y finalidades</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Objeto</h3>
              <p>La Política brinda al titular de los datos personales los derechos que le asisten y enuncia los controles que garantizan la privacidad de su información como titular de la misma; le informa los tratamientos a los que serán sometidos sus datos, describe su ciclo de vida (colecta, conservación, circulación, uso y/o explotación y disposición final); igualmente, le permite conocer los canales de comunicación con la entidad responsable para gestionar las solicitudes relacionadas con su información, así como para la presentación de quejas en caso de requerirse.</p>
              <p>La entidad asume esta Política como un compromiso ante los titulares de la información.</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Alcance</h3>
              <p>La presente Política aplica a todos los tratamientos de datos personales que se efectúen directamente por parte de esta entidad, como responsable del tratamiento de datos personales, y a los tratamientos específicos que se encomienden a terceros encargados, quienes, en cumplimiento de contratos celebrados con el titular, traten sus datos personales.</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Obligaciones</h3>
              <p>Esta Política es de obligatorio cumplimiento en todos los procesos y procedimientos que de manera directa o indirecta traten datos personales; igualmente es de obligatorio cumplimiento para todas las áreas administrativas, directivas y organizacionales de esta entidad, las cuales incluyen dentro de sus políticas internas, los principios rectores exigidos para el tratamiento de datos personales.</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Finalidades</h3>
              <p>Las finalidades responden a los propósitos que la entidad pretende alcanzar con el tratamiento de los datos personales, estos propósitos son permitidos en tanto cumplan con cuatro condiciones: a) Determinados; b) Explícitos; c) Legítimos; d) Informados al titular.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-2">Actividades de marketing</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Investigaciones de mercado.</li>
                    <li>Creación de estrategias de promoción y difusión.</li>
                    <li>Desarrollo de campañas publicitarias.</li>
                    <li>Compartir con encargados para actividades de marketing.</li>
                    <li>Identificación de necesidades y preferencias.</li>
                    <li>Construcción de reputación de marca.</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-2">Actividades comerciales</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Venta de productos y servicios.</li>
                    <li>Identificación de potenciales clientes.</li>
                    <li>Promoción de productos y servicios.</li>
                    <li>Negociación de precios y términos.</li>
                    <li>Distribución y entrega.</li>
                    <li>Prestar los servicios ofrecidos.</li>
                  </ul>
                </div>

                <div className="bg-white p-4 border rounded-lg shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-2">Actividades de la empresa</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Cumplir obligaciones legales.</li>
                    <li>Gestionar trámites, solicitudes y quejas.</li>
                    <li>Contactar al titular para extractos o facturas.</li>
                    <li>Ofrecer programas de bienestar.</li>
                    <li>Verificar seguridad (cámaras, registros).</li>
                    <li>Confirmación de datos personales.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="datos-colectados" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Datos colectados</h2>
              <p>La entidad, como responsable, y los encargados podrán colectar los datos clasificados como: públicos, sensibles, comunes y de categorías especiales, los cuales serán utilizados única y exclusivamente con las finalidades establecidas en los avisos de privacidad.</p>
              
              <div className="overflow-x-auto mt-4 mb-6">
                <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left border-b w-12">N°</th>
                      <th className="py-3 px-4 text-left border-b w-1/4">Categoría de Dato</th>
                      <th className="py-3 px-4 text-left border-b">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-4 font-medium">01</td>
                      <td className="py-3 px-4 font-bold text-sm">DATO SENSIBLE</td>
                      <td className="py-3 px-4 text-sm">Salud, biométricos, genéticos, raciales o étnicos, religiosos o filosóficos, de carácter sexual, datos de niñas, niños y adolescentes.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">02</td>
                      <td className="py-3 px-4 font-bold text-sm">DATO COMÚN</td>
                      <td className="py-3 px-4 text-sm">Identificación, vida profesional, vida personal, conexión, localización (GPS), financieros, transaccionales.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">03</td>
                      <td className="py-3 px-4 font-bold text-sm">DATO PÚBLICO</td>
                      <td className="py-3 px-4 text-sm">Contacto de profesionales, contacto de representantes o servidores públicos, histórico de funciones.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">04</td>
                      <td className="py-3 px-4 font-bold text-sm">CATEGORÍA ESPECIAL</td>
                      <td className="py-3 px-4 text-sm">Personas fallecidas, personas con discapacidad, datos crediticios, antecedentes penales, disciplinarios.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-3">Canales de Colecta</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 list-disc pl-5">
                <li>Formulario físico</li>
                <li>Formulario electrónico</li>
                <li>Banners o cookies</li>
                <li>Grabación telefónica</li>
                <li>Tomas de video o fotográficas</li>
                <li>Grabación de audio</li>
                <li>Uso de sensores electrónicos</li>
              </ul>
            </section>

            <section id="base-legal" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Base legal para el tratamiento</h2>
              <p className="mb-4">El tratamiento de datos personales solo podrá efectuarse bajo alguna de las siguientes causales de autorización en conformidad al artículo 7 de la Ley Orgánica de Protección de Datos Personales:</p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Por consentimiento del titular para el tratamiento de sus datos personales.</li>
                <li>Cumplimiento de una obligación legal por parte del responsable.</li>
                <li>Por orden judicial.</li>
                <li>Cumplimiento de una misión realizada en interés público o ejercicio de poderes públicos.</li>
                <li>Para la ejecución de medidas precontractuales o cumplimiento de obligaciones contractuales.</li>
                <li>Para proteger intereses vitales del interesado u otra persona.</li>
                <li>Datos personales que consten en bases de datos de acceso público.</li>
                <li>Para satisfacer un interés legítimo del responsable, siempre que no prevalezcan derechos fundamentales.</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h4 className="font-bold text-blue-900 mb-2">Protección de Menores</h4>
                <p className="text-sm text-blue-800 mb-0">
                  Los datos personales de niños, niñas y adolescentes se colectan en cumplimiento del régimen general; y en adición, el tratamiento responde al <strong>interés superior de preservar sus garantías fundamentales</strong>.
                </p>
              </div>
            </section>

            <section id="seguridad-datos" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Seguridad, circulación, uso y disposición de datos</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Seguridad de los datos</h3>
                  <p>El responsable y sus encargados se comprometen a conservar los datos bajo las condiciones necesarias, garantizando confidencialidad, integralidad y disponibilidad, implementando las medidas de seguridad correspondientes.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Circulación de los datos personales</h3>
                  <p>Nos comprometemos a transferir los datos tratados a destinatarios en países que ofrezcan un nivel de protección similar al de Ecuador. Caso contrario, se cumplirá lo preceptuado en la LOPD, capítulo IX.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Disposición final</h3>
                  <p>Los datos serán eliminados una vez se haya satisfecho la finalidad para la cual fueron gestionados. La eliminación se podrá hacer de forma: Automática, Manual, Individual o En conjunto. Estamos facultados para archivar datos para fines de interés público, investigación o estadística con debida custodia.</p>
                </div>
              </div>
            </section>

            <section id="derechos-titulares" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Derecho de los titulares</h2>
              <p className="mb-4">El responsable se obliga a dar trámite a las solicitudes para hacer efectivos los derechos otorgados por la ley. Como titular, usted cuenta con los siguientes derechos:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg bg-white shadow-sm">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">1</span> Información y Acceso</h4>
                  <p className="text-sm mt-2 text-gray-600">Ser informado sobre fines y conocer gratuitamente todos sus datos en un plazo no superior a 15 días.</p>
                </div>
                <div className="border p-4 rounded-lg bg-white shadow-sm">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">2</span> Rectificación y Eliminación</h4>
                  <p className="text-sm mt-2 text-gray-600">Corregir datos inexactos y solicitar la eliminación inmediata sin justificación.</p>
                </div>
                <div className="border p-4 rounded-lg bg-white shadow-sm">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">3</span> Oposición y Suspensión</h4>
                  <p className="text-sm mt-2 text-gray-600">No autorizar ciertos usos o solicitar la suspensión del tratamiento bajo condiciones de ley.</p>
                </div>
                <div className="border p-4 rounded-lg bg-white shadow-sm">
                  <h4 className="font-bold text-blue-700 flex items-center gap-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">4</span> Portabilidad</h4>
                  <p className="text-sm mt-2 text-gray-600">Recibir sus datos en formato digital compatible para transferirlos a otros responsables.</p>
                </div>
              </div>
            </section>

            <section id="consultas" className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Consulta y soluciones</h2>
              
              <div className="bg-gray-800 text-white p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Contacto Oficial</h3>
                <p className="mb-4">Para ejercer sus derechos o presentar reclamos, comuníquese con nuestro Delegado de Protección de Datos (DPDP):</p>
                <a href="mailto:protecciondedatos@colegioseva.edu.ec" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded transition-colors">
                  protecciondedatos@colegioseva.edu.ec
                </a>
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">Información necesaria para la solicitud:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Tipo de remitente (Titular o autorizado).</li>
                <li>Nombre del solicitante y documento de identidad.</li>
                <li>Documento que acredite autorización (si aplica).</li>
                <li>Descripción clara de los hechos y datos objeto de consulta.</li>
                <li>Información de contacto (correo y/o teléfono).</li>
              </ul>
            </section>

            <section id="definiciones">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Principios Fundamentales</h2>
              <p className="mb-4">Nuestro tratamiento de datos se rige bajo los siguientes principios constitucionales y legales:</p>
              
              <ul className="space-y-3 text-sm">
                <li><strong>Juridicidad, Lealtad y Transparencia:</strong> Los datos se tratan con estricto apego a la ley, con conocimiento pleno del titular y mediante lenguajes claros y accesibles.</li>
                <li><strong>Finalidad, Pertinencia y Minimización:</strong> Solo se recopilan los datos estrictamente necesarios para los fines legítimos comunicados al titular, y no se usan para fines distintos.</li>
                <li><strong>Confidencialidad y Seguridad:</strong> Mantenemos el debido sigilo, implementando medidas organizativas y técnicas frente a riesgos y vulnerabilidades.</li>
                <li><strong>Calidad, Conservación y Responsabilidad demostrada:</strong> Los datos deben ser exactos y conservarse solo por el tiempo necesario. Acreditamos nuestros mecanismos de protección continuamente.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
