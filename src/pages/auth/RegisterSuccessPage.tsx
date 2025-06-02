
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Cadastro Enviado!</CardTitle>
          <CardDescription>
            Seu pedido de cadastro foi enviado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-100 text-green-800 p-6 rounded-lg">
            <h2 className="font-semibold text-xl mb-2">O que acontece agora?</h2>
            <p className="mb-4">
              Nossa equipe irá analisar seus dados e documentação.
              <br />
              Isso pode levar até 2 dias úteis.
            </p>
            <p>
              Você receberá um email quando seu cadastro for aprovado.
            </p>
          </div>
          
          <div>
            <Button asChild>
              <Link to="/">Voltar para a página inicial</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
