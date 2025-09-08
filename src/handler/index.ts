import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";
import { InferenceClient } from '@huggingface/inference';

export const resumir = async (req: Request, res: Response) => {

    const hf = new InferenceClient(process.env.API_KEY)
    
    function dividirTexto(texto: string, tamano: number = 1000): string[] {
        const partes: string[] = [];
        for (let i = 0; i < texto.length; i += tamano) {
            partes.push(texto.substring(i, i + tamano));
        }
        return partes;
    }

    const form = formidable({ multiples: true });

    form.parse(req, async (error, fileds, files) => {

        try {
            if (error) {
                const error = new Error("Error al subir el archivo");
                return res.status(400).send(error)
            }

            if(!files.pdf || files.pdf.length === 0) {
                const error = new Error("No se ha subido ningun archivo");
                return res.status(400).json({
                    error: error.message
                })
            }

            if (files.pdf[0].mimetype !== "application/pdf") {
                const error = new Error("Este no es un formato PDF");
                return res.status(415).json({
                    error: error.message
                })

            }

            if (files.pdf[0].size > 3000000) {
                const error = new Error("El archivo es demasiado grande");
                return res.status(413).json({
                    error: error.message
                })
            }

            const file = files.pdf[0].filepath
            const dataBuffer = await fs.promises.readFile(file)
            const data = await pdf(dataBuffer)
            const contenido = data.text

            if (contenido === "") {
                const error = new Error("El archivo esta vacio");
                return res.status(200).json({
                    error: error.message
                })
            }

            const bloques = dividirTexto(contenido, 1200)
            const resumen: string[] = []

            for (const bloque of bloques) {

                try {
                    const response = await hf.summarization({
                        model: "facebook/bart-large-cnn",
                        inputs: bloque,
                        parameters: {
                            max_length: 200,
                            min_length: 100,
                            temperature: 0.2
                        }
                    })
                    resumen.push(response.summary_text)

                } catch (error) {
                    console.log(error)
                    resumen.push("Hubo un error al resumir el texto")
                }

            }
            const resumenFinal = resumen.join(" ")

            return res.status(200).json({
                resumen: resumenFinal
            })

        } catch (error) {
            console.log(error)
        }
    })

}