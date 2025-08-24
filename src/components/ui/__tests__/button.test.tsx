import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('deve renderizar com texto correto', () => {
    const { getByRole } = render(<Button>Clique aqui</Button>);
    
    expect(getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument();
  });

  it('deve aplicar variante default corretamente', () => {
    const { getByRole } = render(<Button>Botão Default</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('deve aplicar variante secondary', () => {
    const { getByRole } = render(<Button variant="secondary">Botão Secundário</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('deve aplicar variante outline', () => {
    const { getByRole } = render(<Button variant="outline">Botão Outline</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('deve aplicar tamanho sm', () => {
    const { getByRole } = render(<Button size="sm">Botão Pequeno</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('h-9');
  });

  it('deve aplicar tamanho lg', () => {
    const { getByRole } = render(<Button size="lg">Botão Grande</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('h-11');
  });

  it('deve estar desabilitado quando disabled=true', () => {
    const { getByRole } = render(<Button disabled>Botão Desabilitado</Button>);
    
    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('deve chamar onClick quando clicado', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Clique</Button>);
    
    const button = getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve chamar onClick quando desabilitado', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByRole } = render(<Button disabled onClick={handleClick}>Clique</Button>);
    
    const button = getByRole('button');
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve aceitar className customizada', () => {
    const { getByRole } = render(<Button className="custom-class">Botão</Button>);
    
    const button = getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('deve renderizar como link quando asChild=true', () => {
    const { getByRole } = render(
      <Button asChild>
        <a href="/test">Link Botão</a>
      </Button>
    );
    
    const link = getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('inline-flex');
  });
});